import React from 'react';
import { Title, Text, Container, Grid, Card, Badge, Group, TextInput, SegmentedControl, Button, Stack, ThemeIcon, Radio, Textarea, Select, Alert, Box, Center, SimpleGrid } from '@mantine/core';

import { CheckCircle2, XCircle, Clock, ChevronRight, MessageSquare, Calendar, ArrowRightCircle, AlertTriangle, Search } from 'lucide-react';
import { EVALUATION_RESULT_TYPES } from '../../../shared/constants';
import { TIME_TYPES, TIME_TYPE_LABELS } from '../../../shared/utils/scheduleHelpers';
import { usePartnerAdmin } from '../hooks/usePartnerAdmin';

export default function PartnerAdminView({ partnerFilter }) {
    const {
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
        selectedRequest, setSelectedRequest,
        stagedData, setStagedData,
        counts,
        displayRequests,
        currentRequest,
        handleConfirmReception,
        handleSave
    } = usePartnerAdmin(partnerFilter);

    // Filter Options for SegmentedControl
    const filterOptions = [
        {
            label: (
                <Group gap={6} align="center" justify="center">
                    <Text span size="md" fw={700}>미확인 ({counts.unconfirmed})</Text>
                    {counts.unconfirmed > 0 && <Box w={6} h={6} style={{ borderRadius: '50%' }} bg="red.5" />}
                </Group>
            ),
            value: 'unconfirmed'
        },
        {
            label: (
                <Group gap={6} align="center" justify="center">
                    <Text span size="md" fw={700}>확인완료 ({counts.processing})</Text>
                    {counts.processing > 0 && <Box w={6} h={6} style={{ borderRadius: '50%' }} bg="blue.5" />}
                </Group>
            ),
            value: 'processing'
        },
        {
            label: <Text span size="md" fw={700}>처리완료 ({counts.completed})</Text>,
            value: 'completed'
        },
        {
            label: <Text span size="md" fw={700}>전체 ({counts.all})</Text>,
            value: 'all'
        },
    ];

    return (
        <Container fluid p="xl" className="animate-in fade-in duration-700">
            <Stack mb="xl">
                <Group justify="space-between" align="flex-end">
                    <div>
                        <Title order={1} c="hyundai-navy" fw={900} ls="-0.03em">
                            {partnerFilter ? `${partnerFilter} 관리자 워크보드` : '협력사 통합 관리자 워크보드'}
                        </Title>
                        <Text c="dimmed" fw={500} size="sm">방문평가 일정변경 요청 관리</Text>
                    </div>
                </Group>

                <Stack gap="sm">
                    {/* Search Bar - Restored Position */}
                    <TextInput
                        placeholder="차량번호 검색"
                        leftSection={<Search size={16} />}
                        size="md"
                        radius="md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                    />

                    {/* Filters */}
                    <SegmentedControl
                        value={filterStatus}
                        onChange={(val) => {
                            setFilterStatus(val);
                            setSelectedRequest(null);
                        }}
                        data={filterOptions}
                        color="hyundai-blue"
                        radius="md"
                        size="md"
                        fullWidth
                    />
                </Stack>
            </Stack>

            <Grid gutter="xl">
                {/* 요청 리스트 (Left Column) */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Stack gap="md">
                        {displayRequests.length === 0 ? (
                            <Center h={400} bg="gray.0" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
                                <Stack align="center" gap="xs" c="dimmed">
                                    <Clock size={48} opacity={0.2} />
                                    <Text fw={600} size="sm">요청이 없습니다.</Text>
                                </Stack>
                            </Center>
                        ) : (
                            displayRequests.map((req) => (
                                <Card
                                    key={req.id}
                                    withBorder
                                    padding="lg"
                                    radius="lg"
                                    onClick={() => setSelectedRequest(req)}
                                    className={`cursor-pointer transition-all ${selectedRequest?.id === req.id
                                        ? 'border-hyundai-blue ring-2 ring-hyundai-blue/20 bg-blue-50/10'
                                        : 'hover:border-gray-300 hover:shadow-md'
                                        }`}
                                >
                                    <Group justify="space-between" mb="xs">
                                        <Group gap="xs">
                                            <Title order={3} size="h4" fw={900} c="dark">{req.carNumber}</Title>
                                            <Badge
                                                variant="light"
                                                color={
                                                    req.status === 'pending' ? 'orange' :
                                                        req.status === 'received' ? 'blue' :
                                                            req.status === 'success' ? 'green' :
                                                                (req.status === 'failed' || req.status === 'terminated') ? 'red' : 'gray'
                                                }
                                            >
                                                {req.status === 'pending' ? '미확인 접수' :
                                                    req.status === 'received' ? '일정조정 진행중' :
                                                        req.status === 'success' ? '조정 성공' :
                                                            req.status === 'transferred' ? '타사 이관됨' :
                                                                req.status === 'terminated' ? '종결됨' :
                                                                    req.status === 'cancelled' ? '요청 취소됨' : '조정 불가'}
                                            </Badge>
                                        </Group>
                                        <Text size="xs" c="dimmed" fw={700}>{req.createdAt}</Text>
                                    </Group>

                                    <Group gap="xl" mb="md">
                                        <Group gap={4}>
                                            <ThemeIcon variant="light" color="gray" size="sm"><Calendar size={12} /></ThemeIcon>
                                            <Text size="sm" fw={700} c="dimmed">희망일시</Text>
                                            <Text size="sm" fw={900}>
                                                {req.requestedSchedule?.date} | {
                                                    req.requestedSchedule?.timeType === TIME_TYPES.SPECIFIC
                                                        ? req.requestedSchedule.timeValue
                                                        : TIME_TYPE_LABELS[req.requestedSchedule?.timeType]
                                                }
                                            </Text>
                                        </Group>
                                    </Group>

                                    <Group justify="space-between" align="center" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-1)' }}>
                                        <Group gap={6} style={{ flex: 1, minWidth: 0 }}>
                                            <MessageSquare size={14} className="text-gray-400 shrink-0" />
                                            <Text size="sm" c="dimmed" truncate fs="italic">
                                                "{req.reason || '사유 없음'}"
                                            </Text>
                                        </Group>
                                        <Group>
                                            {!partnerFilter && <Badge variant="outline" color="gray" size="xs">{req.partner}</Badge>}
                                            <ThemeIcon variant="subtle" color={selectedRequest?.id === req.id ? 'hyundai-blue' : 'gray'}>
                                                <ChevronRight size={18} />
                                            </ThemeIcon>
                                        </Group>
                                    </Group>
                                </Card>
                            ))
                        )}
                    </Stack>
                </Grid.Col>

                {/* 상세 보기 (Right Column / Sticky) */}
                <Grid.Col span={{ base: 12, lg: 4 }} className="border-l-0 lg:border-l-2 lg:border-dashed lg:border-gray-300 lg:pl-8">
                    <Box style={{ position: 'sticky', top: 20 }}>
                        {currentRequest ? (
                            <Card withBorder shadow="md" radius="lg" padding="xl" className="border-t-[6px] border-t-hyundai-navy">
                                <Stack gap="lg">
                                    <Group justify="space-between">
                                        <div>
                                            <Title order={2} fw={900}>{currentRequest.carNumber}</Title>
                                            <Text size="xs" c="dimmed">ID: {currentRequest.id}</Text>
                                        </div>
                                        <Badge size="lg" variant="filled" color="dark">{currentRequest.partner}</Badge>
                                    </Group>

                                    <Card bg="gray.0" radius="md" padding="md">
                                        <Stack gap="xs">
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">요청자</Text>
                                                <Text size="sm" fw={700}>{currentRequest.requester}</Text>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">연락처</Text>
                                                <Text size="sm" fw={700} c="hyundai-blue" component="a" href={`tel:${currentRequest.requesterPhone}`}>{currentRequest.requesterPhone}</Text>
                                            </Group>
                                        </Stack>
                                    </Card>

                                    {/* Status specific actions */}
                                    {currentRequest.status === 'cancelled' && (
                                        <Alert color="gray" title="요청 취소됨" icon={<XCircle size={16} />}>
                                            요청자에 의해 취소된 건입니다.
                                        </Alert>
                                    )}

                                    {currentRequest.status === 'transferred' && (
                                        <Alert color="gray" title="타사 이관됨" icon={<ArrowRightCircle size={16} />}>
                                            오배정으로 인해 자동 이관되었습니다.
                                        </Alert>
                                    )}

                                    {currentRequest.status === 'terminated' && (
                                        <Alert color="red" title="종결됨" icon={<AlertTriangle size={16} />}>
                                            양사 모두 '배정된 차량 아님' 판정.
                                        </Alert>
                                    )}

                                    {currentRequest.status === 'pending' && (
                                        <Button fullWidth size="lg" color="hyundai-blue" onClick={() => handleConfirmReception(currentRequest.id)}>
                                            지금 접수 확인하기
                                        </Button>
                                    )}

                                    {['received', 'success', 'failed'].includes(currentRequest.status) && (
                                        <Stack gap="md">
                                            {currentRequest.status === 'received' ? (
                                                <Alert color="blue" title="일정조정 진행중" icon={<CheckCircle2 size={16} />}>
                                                    {currentRequest.receivedAt} 확인완료.
                                                </Alert>
                                            ) : (
                                                <Alert color="yellow" title="처리 결과 수정" icon={<AlertTriangle size={16} />}>
                                                    현재 <strong>{currentRequest.status === 'success' ? '조정 성공' : '조정 불가'}</strong> 상태입니다.
                                                    <br />
                                                    새로운 결과로 덮어쓰려면 아래에서 다시 선택하세요.
                                                </Alert>
                                            )}

                                            <Text size="xs" fw={700} c="dimmed" tt="uppercase">조정 결과 처리</Text>
                                            <SimpleGrid cols={2} spacing="md">
                                                <Button
                                                    size="lg"
                                                    radius="xl"
                                                    variant={stagedData.status === 'success' ? 'filled' : 'outline'}
                                                    color="teal"
                                                    onClick={() => setStagedData(prev => ({ ...prev, status: 'success', detailedReason: '' }))}
                                                    style={{
                                                        height: '60px',
                                                        borderWidth: '2px',
                                                        fontSize: '16px',
                                                        fontWeight: 800
                                                    }}
                                                >
                                                    조정 성공
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    radius="xl"
                                                    variant={stagedData.status === 'failed' ? 'filled' : 'outline'}
                                                    color="red"
                                                    onClick={() => setStagedData(prev => ({ ...prev, status: 'failed', detailedReason: '' }))}
                                                    style={{
                                                        height: '60px',
                                                        borderWidth: '2px',
                                                        fontSize: '16px',
                                                        fontWeight: 800
                                                    }}
                                                >
                                                    조정 불가
                                                </Button>
                                            </SimpleGrid>

                                            {/* 성공 Flow */}
                                            {stagedData.status === 'success' && (
                                                <Card withBorder bg="teal.0" style={{ borderColor: 'var(--mantine-color-teal-2)' }}>
                                                    <Stack gap="sm">
                                                        <Radio.Group
                                                            label="상세 내용"
                                                            value={stagedData.detailedReason}
                                                            onChange={(val) => setStagedData(prev => ({ ...prev, detailedReason: val }))}
                                                        >
                                                            <Stack gap="xs" mt="xs">
                                                                <Radio
                                                                    value={EVALUATION_RESULT_TYPES.SUCCESS_ORIGINAL.id}
                                                                    label={
                                                                        <Group gap={6} align="center">
                                                                            <Text size="sm">{EVALUATION_RESULT_TYPES.SUCCESS_ORIGINAL.label}</Text>
                                                                            <Text size="sm" fw={800} c="hyundai-blue">
                                                                                {currentRequest?.requestedSchedule?.date} | {
                                                                                    currentRequest?.requestedSchedule?.timeType === TIME_TYPES.SPECIFIC
                                                                                        ? currentRequest.requestedSchedule.timeValue
                                                                                        : TIME_TYPE_LABELS[currentRequest?.requestedSchedule?.timeType]
                                                                                }
                                                                            </Text>
                                                                        </Group>
                                                                    }
                                                                    color="teal"
                                                                />
                                                                <Radio
                                                                    value={EVALUATION_RESULT_TYPES.SUCCESS_OTHER.id}
                                                                    label={EVALUATION_RESULT_TYPES.SUCCESS_OTHER.label}
                                                                    color="teal"
                                                                />
                                                            </Stack>
                                                        </Radio.Group>

                                                        {stagedData.detailedReason === 'success_other' && (
                                                            <Stack gap="xs">
                                                                <TextInput
                                                                    type="date"
                                                                    label="변경한 날짜"
                                                                    value={stagedData.confirmedDate instanceof Date ? stagedData.confirmedDate.toISOString().split('T')[0] : stagedData.confirmedDate}
                                                                    onChange={(e) => setStagedData(prev => ({ ...prev, confirmedDate: new Date(e.target.value) }))}
                                                                />
                                                                <Select
                                                                    label="시간대"
                                                                    data={[
                                                                        { label: '오전 중', value: TIME_TYPES.AM },
                                                                        { label: '오후 중', value: TIME_TYPES.PM },
                                                                        { label: '직접 선택', value: TIME_TYPES.SPECIFIC }
                                                                    ]}
                                                                    value={stagedData.confirmedTimeType}
                                                                    onChange={(val) => setStagedData(prev => ({ ...prev, confirmedTimeType: val, confirmedTimeValue: val === TIME_TYPES.SPECIFIC ? prev.confirmedTimeValue : '' }))}
                                                                />
                                                                {stagedData.confirmedTimeType === TIME_TYPES.SPECIFIC && (
                                                                    <Select
                                                                        data={[...Array(8)].map((_, i) => ({ value: `${i + 10}:00`, label: `${i + 10}:00` }))}
                                                                        value={stagedData.confirmedTimeValue}
                                                                        onChange={(val) => setStagedData(prev => ({ ...prev, confirmedTimeValue: val }))}
                                                                        placeholder="시간 선택"
                                                                    />
                                                                )}
                                                            </Stack>
                                                        )}
                                                    </Stack>
                                                </Card>
                                            )}

                                            {/* 실패 Flow */}
                                            {stagedData.status === 'failed' && (
                                                <Card withBorder bg="red.0" style={{ borderColor: 'var(--mantine-color-red-2)' }}>
                                                    <Radio.Group
                                                        label="불가 사유"
                                                        value={stagedData.detailedReason}
                                                        onChange={(val) => setStagedData(prev => ({ ...prev, detailedReason: val }))}
                                                    >
                                                        <Stack gap="xs" mt="xs">
                                                            <Radio value={EVALUATION_RESULT_TYPES.FAILURE_PARTNER.id} label={EVALUATION_RESULT_TYPES.FAILURE_PARTNER.label} color="red" />
                                                            <Radio value={EVALUATION_RESULT_TYPES.FAILURE_CUSTOMER.id} label={EVALUATION_RESULT_TYPES.FAILURE_CUSTOMER.label} color="red" />
                                                            <Radio value={EVALUATION_RESULT_TYPES.FAILURE_WRONG_PARTNER.id} label={EVALUATION_RESULT_TYPES.FAILURE_WRONG_PARTNER.label} color="red" />
                                                        </Stack>
                                                    </Radio.Group>

                                                    {stagedData.detailedReason === 'failure_wrong_partner' && (
                                                        <Alert mt="sm" color="orange" title="주의">
                                                            저장 시 타 협력사로 자동 이관됩니다.
                                                        </Alert>
                                                    )}

                                                    {stagedData.detailedReason && stagedData.detailedReason !== 'failure_wrong_partner' && (
                                                        <Textarea
                                                            mt="sm"
                                                            placeholder="상세 사유 입력"
                                                            rows={2}
                                                            value={stagedData.rejectReason}
                                                            onChange={(e) => setStagedData(prev => ({ ...prev, rejectReason: e.target.value }))}
                                                        />
                                                    )}
                                                </Card>
                                            )}

                                            <Button
                                                fullWidth
                                                size="md"
                                                onClick={handleSave}
                                                disabled={
                                                    !stagedData.status ||
                                                    !stagedData.detailedReason ||
                                                    (stagedData.detailedReason === 'success_other' && (!stagedData.confirmedDate || !stagedData.confirmedTimeType))
                                                }
                                            >
                                                저장하기
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            </Card>
                        ) : (
                            <Center h={400} bg="gray.0" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
                                <Stack align="center" gap="sm" c="dimmed">
                                    <Clock size={48} opacity={0.2} />
                                    <Text size="sm" fw={600}>처리할 요청을 선택해주세요</Text>
                                </Stack>
                            </Center>
                        )}
                    </Box>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
