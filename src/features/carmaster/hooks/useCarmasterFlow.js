import { useState } from 'react';
import { PARTNERS } from '../../../shared/constants';
import { parseCustomDate, getDiffDays, getCurrentFormattedDateTime } from '../../../shared/utils/dateHelpers';
import { useRequestStore } from '../../../core/store/useRequestStore';
import { TIME_TYPES } from '../../../shared/utils/scheduleHelpers';

import { APP_CONFIG } from '../../../core/config';
import { useRecentCars } from './useRecentCars';
import { generateRequestId } from '../../../shared/utils/idGenerator';

export const useCarmasterFlow = () => {
    const { requests, addRequest, updateRequestStatus, showToast } = useRequestStore();
    const { recentCars, pushRecentCar } = useRecentCars();

    const [viewMode, setViewMode] = useState('SEARCH');
    const [carNumber, setCarNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [activeRequestId, setActiveRequestId] = useState(null);
    const [searchError, setSearchError] = useState('');

    const [formData, setFormData] = useState({
        carNumber: '',
        partner: '',
        hopeDate: '',
        hopeTimeType: '',
        hopeHour: '',
        reason: '',
        dept: '',
        name: '',
        phone: '010-'
    });

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateField = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBackToSearch = () => {
        setViewMode('SEARCH');
        setActiveRequestId(null);
        setSearchError('');
    };

    // Check local storage directly for cross-tab consistency
    const checkDuplicateRequest = (targetCarNumber) => {
        const normalizedSearch = targetCarNumber.trim().replace(/\s/g, '');

        let currentRequests = requests;

        // Try to get the latest state from localStorage to handle cross-tab synchronization
        try {
            const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.state && Array.isArray(parsed.state.requests)) {
                    currentRequests = parsed.state.requests;
                }
            }
        } catch (e) {
            console.error('Failed to parse localStorage', e);
        }

        return currentRequests.find(req => {
            if (!req.carNumber) return false;
            const reqCarNum = req.carNumber.replace(/\s/g, '');
            if (reqCarNum !== normalizedSearch) return false;

            const createdDate = parseCustomDate(req.createdAt);
            const diffDays = getDiffDays(createdDate);

            // 7일 이내 건 중 '취소됨'이 아닌 건만 결과 페이지(STATUS)로 가이드
            return diffDays <= 7 && req.status !== 'cancelled';
        });
    };

    const handleSearch = (providedNumber) => {
        // Handle cases where providedNumber is not a string (e.g., React event object)
        const targetNumber = (typeof providedNumber === 'string') ? providedNumber : carNumber;
        setSearchError('');

        if (!targetNumber || !targetNumber.trim()) {
            setSearchError('차량 번호를 입력해 주세요.');
            return;
        }

        const normalizedSearch = targetNumber.trim().replace(/\s/g, '');

        // 1. 차량번호 형식 검증 (숫자 2-3자리 + 한글 + 숫자 4자리)
        const carNumberRegex = /^(\d{2,3})[가-힣](\d{4})$/;
        if (!carNumberRegex.test(normalizedSearch)) {
            showToast('차량번호 형식이 올바르지 않습니다. (예: 123가4567)', 'error');
            return;
        }

        pushRecentCar(normalizedSearch);
        setSearchError('');

        const existingRequest = checkDuplicateRequest(normalizedSearch);

        if (existingRequest) {
            setActiveRequestId(existingRequest.id);
            setViewMode('STATUS');
        } else {
            // 폼 데이터 완전 초기화 (이전 입력값이 남아있지 않도록)
            setFormData({
                carNumber: normalizedSearch,
                partner: '',
                hopeDate: '',
                hopeTimeType: '',
                hopeHour: '',
                reason: '',
                dept: '',
                name: '',
                phone: '010-'
            });
            setViewMode('FORM');
        }
    };

    const handleCancelRequest = (requestId) => {
        // window.confirm/alert 제거 (TestSprite 자동화 대응)
        updateRequestStatus(requestId, { status: 'cancelled' });
        handleBackToSearch();
    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        // 제출 직전 중복 체크 강화 (Double Check)
        const existingRequest = checkDuplicateRequest(formData.carNumber);
        if (existingRequest) {
            showToast('이미 진행 중인 요청이 있어 해당 화면으로 이동합니다.', 'warning');
            setIsSubmitting(false);
            setActiveRequestId(existingRequest.id);
            setViewMode('STATUS');
            return;
        }

        const createdAt = getCurrentFormattedDateTime();
        const newId = generateRequestId(requests);

        const newRequest = {
            id: newId,
            carNumber: formData.carNumber,
            customerName: '미지정 고객',
            partner: formData.partner,
            requestedSchedule: {
                date: formData.hopeDate || '',
                timeType: formData.hopeTimeType === 'custom' ? TIME_TYPES.SPECIFIC : (formData.hopeTimeType === 'pm' ? TIME_TYPES.PM : TIME_TYPES.AM),
                timeValue: formData.hopeTimeType === 'custom' ? `${formData.hopeHour}:00` : null
            },
            reason: formData.reason,
            requester: `${formData.name} (${formData.dept})`,
            requesterPhone: formData.phone,
            status: 'pending',
            createdAt: createdAt
        };

        setTimeout(() => {
            addRequest(newRequest);
            setIsSubmitting(false);
            setIsSuccess(true);
            setActiveRequestId(newRequest.id);

            setTimeout(() => {
                setIsSuccess(false);
                setViewMode('STATUS');
            }, 1500);
        }, 1000);
    };

    const activeRequest = requests.find(r => r.id === activeRequestId);

    return {
        viewMode,
        isSubmitting,
        isSuccess,
        carNumber,
        setCarNumber,
        searchError,
        recentCars,
        activeRequest,
        formData,
        handleFieldChange,
        handleUpdateField,
        handleBackToSearch,
        handleSearch,
        handleCancelRequest,
        handleSubmit
    };
};
