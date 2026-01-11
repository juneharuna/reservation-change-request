import { useState, useMemo, useEffect, useRef } from 'react';
import { useRequestStore } from '../../../core/store/useRequestStore';
import { TIME_TYPES } from '../../../shared/utils/scheduleHelpers';
import { getCurrentFormattedDateTime } from '../../../shared/utils/dateHelpers';

export function usePartnerAdmin(partnerFilter) {
    const { requests, updateRequestStatus, showToast, processEvaluationResult } = useRequestStore();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filterStatus, setFilterStatus] = useState('unconfirmed');
    const [searchTerm, setSearchTerm] = useState('');

    // Local staging state for edit form
    const [stagedData, setStagedData] = useState({
        status: '',
        resultType: '',
        detailedReason: '',
        confirmedDate: '',
        confirmedTimeType: '',
        confirmedTimeValue: '',
        rejectReason: ''
    });

    // 사용자가 편집 중인지 추적 (서버 폴링으로 인한 리셋 방지)
    const isEditingRef = useRef(false);
    const previousSelectedIdRef = useRef(null);

    // 1. Filter by Partner
    const baseRequests = useMemo(() =>
        partnerFilter ? requests.filter(r => r.partner === partnerFilter) : requests
        , [requests, partnerFilter]);

    // 2. Filter by Search Term
    const searchedRequests = useMemo(() =>
        baseRequests.filter(req =>
            req.carNumber.replace(/\s/g, '').includes(searchTerm.replace(/\s/g, ''))
        )
        , [baseRequests, searchTerm]);

    // 3. Status Counts
    const counts = useMemo(() => ({
        unconfirmed: searchedRequests.filter(r => r.status === 'pending').length,
        processing: searchedRequests.filter(r => r.status === 'received').length,
        completed: searchedRequests.filter(r => ['success', 'failed', 'cancelled', 'transferred', 'terminated'].includes(r.status)).length,
        all: searchedRequests.length
    }), [searchedRequests]);

    // 4. Final Display List (Filtered & Sorted)
    const displayRequests = useMemo(() => {
        return searchedRequests
            .filter(req => {
                if (filterStatus === 'all') return true;
                if (filterStatus === 'unconfirmed') return req.status === 'pending';
                if (filterStatus === 'processing') return req.status === 'received';
                if (filterStatus === 'completed') return ['success', 'failed', 'cancelled', 'transferred', 'terminated'].includes(req.status);
                return true;
            })
            .sort((a, b) => {
                const parseDate = (str) => {
                    const nums = str.match(/\d+/g);
                    if (!nums || nums.length < 5) return 0;
                    return new Date(nums[0], nums[1] - 1, nums[2], nums[3], nums[4]).getTime();
                };
                return parseDate(b.createdAt) - parseDate(a.createdAt);
            });
    }, [searchedRequests, filterStatus]);

    // Get fresh instance of selected request
    const currentRequest = requests.find(r => r.id === selectedRequest?.id);
    const currentRequestId = currentRequest?.id;

    // 새로운 요청이 선택되었을 때만 stagedData 초기화 (서버 폴링 시에는 리셋하지 않음)
    useEffect(() => {
        // ID가 변경되었을 때만 동기화 (새로운 요청 선택 시)
        if (currentRequestId !== previousSelectedIdRef.current) {
            previousSelectedIdRef.current = currentRequestId;
            isEditingRef.current = false; // 새 요청 선택 시 편집 상태 리셋

            if (currentRequest) {
                setStagedData({
                    status: currentRequest.status,
                    resultType: currentRequest.resultType || '',
                    detailedReason: currentRequest.detailedReason || '',
                    confirmedDate: currentRequest.confirmedSchedule?.date || '',
                    confirmedTimeType: currentRequest.confirmedSchedule?.timeType || '',
                    confirmedTimeValue: currentRequest.confirmedSchedule?.timeValue || '',
                    rejectReason: currentRequest.rejectReason || ''
                });
            }
        }
    }, [currentRequestId, currentRequest]);


    // Handlers
    const handleConfirmReception = (id) => {
        updateRequestStatus(id, {
            status: 'received',
            receivedAt: getCurrentFormattedDateTime()
        });
    };

    const handleSave = () => {
        if (!currentRequest) return;

        let finalConfirmedSchedule = null;
        if (stagedData.detailedReason === 'success_original') {
            finalConfirmedSchedule = currentRequest.requestedSchedule;
        } else if (stagedData.detailedReason === 'success_other') {
            if (stagedData.confirmedDate && stagedData.confirmedTimeType) {
                finalConfirmedSchedule = {
                    date: stagedData.confirmedDate instanceof Date
                        ? stagedData.confirmedDate.toISOString().split('T')[0]
                        : stagedData.confirmedDate,
                    timeType: stagedData.confirmedTimeType,
                    timeValue: stagedData.confirmedTimeType === TIME_TYPES.SPECIFIC ? stagedData.confirmedTimeValue : null
                };
            }
        }

        processEvaluationResult(currentRequest.id, {
            resultType: stagedData.status,
            detailedReason: stagedData.detailedReason,
            confirmedSchedule: finalConfirmedSchedule,
            rejectReason: stagedData.rejectReason
        });

        // Toast Logic
        if (stagedData.detailedReason === 'failure_wrong_partner' && !currentRequest.previousPartner) {
            showToast('타 협력사로 자동 이관되었습니다.', 'success');
        } else if (stagedData.detailedReason === 'failure_wrong_partner' && currentRequest.previousPartner) {
            showToast('확인 불가 건으로 종결되었습니다.', 'error');
        } else {
            showToast('저장이 완료되었습니다.', 'success');
        }
    };

    return {
        // State
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
        selectedRequest, setSelectedRequest,
        stagedData, setStagedData,

        // Derived Data
        counts,
        displayRequests,
        currentRequest,

        // Actions
        handleConfirmReception,
        handleSave
    };
}
