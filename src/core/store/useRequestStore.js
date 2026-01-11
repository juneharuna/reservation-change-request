import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_MOCK_REQUESTS } from '../../shared/constants';
import { generateRequestId } from '../../shared/utils/idGenerator';
import { getCurrentFormattedDateTime } from '../../shared/utils/dateHelpers';
import { storage } from '../services/storage/LocalStorageService';
import { apiService } from '../services/api/apiService';
import { APP_CONFIG } from '../config';

export const useRequestStore = create(
    persist(
        (set, get) => ({
            requests: INITIAL_MOCK_REQUESTS,
            isSaving: false,
            addRequest: async (request) => {
                const updatedRequests = [request, ...get().requests];
                set({ requests: updatedRequests, isSaving: true });
                try {
                    await apiService.saveRequests(updatedRequests);
                } catch (error) {
                    console.error('Persistence failed:', error);
                } finally {
                    set({ isSaving: false });
                }
            },
            updateRequestStatus: async (id, updates) => {
                const updatedRequests = get().requests.map(req =>
                    req.id === id ? { ...req, ...updates } : req
                );
                set({ requests: updatedRequests, isSaving: true });
                try {
                    await apiService.saveRequests(updatedRequests);
                } catch (error) {
                    console.error('Persistence failed:', error);
                } finally {
                    set({ isSaving: false });
                }
            },
            processEvaluationResult: async (id, result) => {
                const state = get();
                const targetRequest = state.requests.find(r => r.id === id);
                if (!targetRequest) return;

                const { resultType, detailedReason, confirmedSchedule, rejectReason } = result;
                const isSuccess = resultType === 'success';
                const now = getCurrentFormattedDateTime();

                let updatedRequests = [];

                // 1. 성공 처리
                if (isSuccess) {
                    updatedRequests = state.requests.map(req =>
                        req.id === id ? {
                            ...req,
                            status: 'success',
                            resultType,
                            detailedReason,
                            confirmedSchedule,
                            rejectReason: '',
                            processedAt: now
                        } : req
                    );
                }
                // 2. 실패 처리 - "해당 차량 아님" (오배정) 인 경우
                else if (detailedReason === 'failure_wrong_partner') {
                    if (targetRequest.previousPartner) {
                        updatedRequests = state.requests.map(req =>
                            req.id === id ? {
                                ...req,
                                status: 'terminated',
                                resultType,
                                detailedReason,
                                rejectReason: '확인되지 않는 차량번호입니다. (양사 모두 미배정)',
                                processedAt: now
                            } : req
                        );
                    } else {
                        const targetPartner = targetRequest.partner === '카뷰' ? 'CTS컴퍼니' : '카뷰';
                        const newRequest = {
                            ...targetRequest,
                            id: generateRequestId(state.requests),
                            partner: targetPartner,
                            status: 'pending',
                            createdAt: now,
                            receivedAt: undefined,
                            processedAt: undefined,
                            transferCount: (targetRequest.transferCount || 0) + 1,
                            previousPartner: targetRequest.partner
                        };

                        updatedRequests = [
                            newRequest,
                            ...state.requests.map(req =>
                                req.id === id ? {
                                    ...req,
                                    status: 'transferred',
                                    resultType,
                                    detailedReason,
                                    rejectReason: `타사 차량(자동 이관됨) -> ${targetPartner}`,
                                    processedAt: now
                                } : req
                            )
                        ];
                    }
                }
                // 3. 일반 실패 처리
                else {
                    updatedRequests = state.requests.map(req =>
                        req.id === id ? {
                            ...req,
                            status: 'failed',
                            resultType,
                            detailedReason,
                            rejectReason,
                            processedAt: now
                        } : req
                    );
                }

                set({ requests: updatedRequests, isSaving: true });
                try {
                    await apiService.saveRequests(updatedRequests);
                } catch (error) {
                    console.error('Persistence failed:', error);
                } finally {
                    set({ isSaving: false });
                }
            },

            toast: { message: '', type: 'success', visible: false },
            showToast: (message, type = 'success') => set({
                toast: { message, type, visible: true }
            }),
            hideToast: () => set((state) => ({
                toast: { ...state.toast, visible: false }
            })),
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),

            fetchRequests: async () => {
                // If we are currently saving, don't overwrite local state with old server data
                if (get().isSaving) return;

                try {
                    const serverRequests = await apiService.fetchRequests();
                    // If server is empty, initialize with current local state
                    if (serverRequests.length === 0) {
                        set({ isSaving: true });
                        await apiService.saveRequests(get().requests);
                        set({ isSaving: false });
                    } else if (!get().isSaving) { // Double check before setting
                        set({ requests: serverRequests });
                    }
                } catch (error) {
                    console.error('fetchRequests error:', error);
                }
            },

            // Cross-tab synchronization action
            syncWithLocalStorage: () => {
                const parsed = storage.get(APP_CONFIG.STORAGE_KEY);
                if (parsed && parsed.state && Array.isArray(parsed.state.requests)) {
                    set({ requests: parsed.state.requests });
                }
            }
        }),
        {
            name: APP_CONFIG.STORAGE_KEY,
            partialize: (state) => ({ requests: state.requests }),
            onRehydrateStorage: () => (state) => {
                state.setHasHydrated(true);
            }
        }
    )
);
