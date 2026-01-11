import React from 'react';
import {
    Card,
    TextInput,
    Button,
    Text,
    Group,
    Stack,
    Textarea,
    Select,
    SimpleGrid,
    Alert,
    ThemeIcon,
    Box
} from '@mantine/core';
import { Building2, Info, Calendar, AlertCircle, User, Check } from 'lucide-react';
import { PARTNERS } from '../../../shared/constants';

const DEPT_LIST = [
    '강원', '경기남부', '경기서부', '경남', '광주전남',
    '남부', '대구경북', '대전충남', '동부', '동북부',
    '부산', '서남부', '서북부', '울산', '인천',
    '전북', '제주', '충북', '본사', '컨택센터'
];

// Helper for mobile phone formatting
const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

export default function FormMode({
    formData,
    onFieldChange,
    onUpdateField,
    onSubmit,
    isSubmitting
}) {
    const handleNameChange = (e) => {
        const { value } = e.target;
        // Allow Korean characters and whitespace
        if (value === '' || /^[ㄱ-ㅎㅏ-ㅣ가-힣\s]*$/.test(value)) {
            onUpdateField('name', value);
        }
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (!value.startsWith('010')) {
            value = '010' + value;
        }
        onUpdateField('phone', formatPhoneNumber(value));
    };

    const isFormValid =
        formData.partner &&
        formData.hopeDate &&
        formData.hopeTimeType &&
        formData.name &&
        formData.phone.length === 13 &&
        (formData.hopeTimeType !== 'custom' || formData.hopeHour) &&
        formData.reason &&
        formData.reason.length >= 10 &&
        formData.dept;

    return (
        <Stack gap="lg" align="stretch" className="animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. 담당 업체 정보 */}
            <Card shadow="sm" padding="lg" radius="md" withBorder className="border-t-4 border-t-hyundai-navy">
                <Group mb="md">
                    <ThemeIcon color="hyundai-navy" variant="light" size="lg">
                        <Building2 size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg" c="gray.9">1. 담당 방문평가업체 선택</Text>
                </Group>

                <Stack gap="sm">
                    <Text size="xs" fw={700} c={!formData.partner ? "red.5" : "dimmed"} tt="uppercase">
                        담당 방문평가업체 (BO 확인 후 선택 필수)
                    </Text>

                    <SimpleGrid cols={2}>
                        {Object.entries(PARTNERS).map(([key, partner]) => {
                            const isSelected = formData.partner === partner.name;
                            return (
                                <Button
                                    key={key}
                                    data-testid={`partner-select-${key}`}
                                    type="button"
                                    variant={isSelected ? "filled" : "default"}
                                    color={isSelected ? (partner.name === '카뷰' ? 'indigo' : 'teal') : 'gray'}
                                    size="lg"
                                    h={60}
                                    onClick={() => onUpdateField('partner', partner.name)}
                                    className="transition-all"
                                    styles={{ root: { borderWidth: isSelected ? 0 : 1 } }}
                                >
                                    {partner.name}
                                </Button>
                            );
                        })}
                    </SimpleGrid>

                    <Alert variant="light" color="gray" icon={<Info size={16} />} title="Notice" classNames={{ message: 'text-xs text-slate-600' }}>
                        올바른 방문평가업체를 선택해 주셔야 신속히 처리됩니다.
                        <br />
                        방문평가 장소 변경은 어렵습니다. 필요 시 취소 후 재신청 해주세요.
                    </Alert>
                </Stack>
            </Card>

            {/* 2. 변경 희망 방문평가 정보 */}
            <Card shadow="sm" padding="lg" radius="md" withBorder className="border-t-4 border-t-hyundai-blue">
                <Group mb="md">
                    <ThemeIcon color="hyundai-blue" variant="light" size="lg">
                        <Calendar size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg" c="gray.9">2. 변경희망 방문평가 일정</Text>
                </Group>

                <Alert variant="light" color="blue" mb="md" icon={<Info size={16} />} title="Notice" classNames={{ message: 'text-xs text-slate-600' }}>
                    방문평가 일정변경 요청은 차량번호당 일주일에 1회만 가능합니다.
                    <br />
                    당일 평가진행은 불가한 경우가 많으므로, 여유있게 요청해 주십시오.
                </Alert>

                <Stack gap="md">
                    <TextInput
                        label="변경 희망 날짜"
                        name="hopeDate"
                        data-testid="input-hope-date"
                        type="date"
                        size="md"
                        value={formData.hopeDate || ''}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => onUpdateField('hopeDate', e.target.value)}
                    />

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>변경 희망 시간</Text>
                        <Group grow>
                            {['am', 'pm', 'custom'].map(type => (
                                <Button
                                    key={type}
                                    data-testid={`time-type-${type}`}
                                    type="button"
                                    variant={formData.hopeTimeType === type ? 'filled' : 'outline'}
                                    color="hyundai-blue"
                                    onClick={() => onUpdateField('hopeTimeType', type)}
                                >
                                    {type === 'am' ? '오전 중' : type === 'pm' ? '오후 중' : '직접 선택'}
                                </Button>
                            ))}
                        </Group>

                        {formData.hopeTimeType === 'custom' && (
                            <Select
                                data={[...Array(8)].map((_, i) => ({ value: `${i + 10}`, label: `${i + 10}:00` }))}
                                placeholder="시간 선택"
                                label="희망 시간 (10시~17시)"
                                data-testid="select-hope-hour"
                                value={formData.hopeHour}
                                onChange={(val) => onUpdateField('hopeHour', val)}
                                mt="xs"
                            />
                        )}
                    </Stack>
                </Stack>
            </Card>

            {/* 3. 일정 변경 사유 */}
            <Card shadow="sm" padding="lg" radius="md" withBorder className="border-t-4 border-t-yellow-500">
                <Group mb="md">
                    <ThemeIcon color="yellow" variant="light" size="lg">
                        <AlertCircle size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg" c="gray.9">3. 일정 변경 사유</Text>
                </Group>



                <Textarea
                    placeholder="신차 출고 일정 변경 등 구체적인 사유를 입력해 주세요 (최대 500자)"
                    label="사유 (최소 10자 이상)"
                    data-testid="textarea-reason"
                    minRows={4}
                    maxLength={500}
                    name="reason"
                    value={formData.reason}
                    onChange={onFieldChange}
                />
            </Card>

            {/* 4. 요청자 정보 */}
            <Card shadow="sm" padding="lg" radius="md" withBorder className="border-t-4 border-t-gray-500">
                <Group mb="md">
                    <ThemeIcon color="gray" variant="light" size="lg">
                        <User size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg" c="gray.9">4. 요청자 정보</Text>
                </Group>

                <Stack gap="xs" mb="md">
                    <Text size="sm" fw={500}>소속 지역본부 (필수 선택)</Text>
                    <SimpleGrid cols={3} spacing="xs">
                        {DEPT_LIST.map((dept) => {
                            const isSelected = formData.dept === dept;
                            return (
                                <Button
                                    key={dept}
                                    data-testid={`dept-select-${dept}`}
                                    type="button"
                                    variant={isSelected ? "filled" : "outline"}
                                    color={isSelected ? "hyundai-blue" : "gray"}
                                    onClick={() => onUpdateField('dept', dept)}
                                    size="xs"
                                    h={42}
                                    px={4}
                                    styles={{
                                        root: {
                                            borderWidth: isSelected ? 0 : 1,
                                            fontSize: '12px',
                                            fontWeight: isSelected ? 800 : 600
                                        },
                                        inner: {
                                            whiteSpace: 'nowrap'
                                        }
                                    }}
                                >
                                    {dept}
                                </Button>
                            );
                        })}
                    </SimpleGrid>
                </Stack>

                <TextInput
                    label="요청자 성함"
                    placeholder="성함 입력"
                    data-testid="input-requester-name"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                />

                <TextInput
                    mt="md"
                    label="요청자 연락처"
                    placeholder="010-0000-0000"
                    data-testid="input-requester-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={13}
                    inputMode="numeric"
                    type="tel"
                />

                <Alert variant="light" color="orange" mt="md" icon={<Info size={16} />} title="Notice" classNames={{ message: 'text-xs text-amber-800' }}>
                    일정변경 요청을 하면, 방문평가업체 또는 평가사가 고객께 일정조율 위해 연락을 드립니다.
                    <br />
                    불필요한 VOC가 발생하지 않도록, 담당자(카마스터 등)가 사전에 일정 변경 필요성을 고객님께 꼭 설명해 주시기 바랍니다.
                </Alert>
            </Card>

            <Box py="xl" ta="center">
                {!isFormValid && (
                    <Text c="red" size="sm" mb="sm" fw={700}>
                        * 필수 항목(업체, 날짜/시간, 사유 10자 이상, 요청자 정보/연락처)을 모두 입력해 주세요.
                    </Text>
                )}
                <Button
                    fullWidth
                    size="xl"
                    radius="xl"
                    color="hyundai-blue"
                    data-testid="button-submit-form"
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting || !isFormValid}
                    loading={isSubmitting}
                    styles={{ root: { height: 60, fontSize: 20 } }}
                >
                    {formData.carNumber} 일정변경 요청하기
                </Button>
            </Box>
        </Stack>
    );
}
