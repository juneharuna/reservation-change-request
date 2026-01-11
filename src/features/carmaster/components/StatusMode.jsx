import React from 'react';
import { Card, Button, Badge, Text, Title, Group, Stack, Stepper, ThemeIcon, Transition, Grid, Box, SimpleGrid } from '@mantine/core';
import { Calendar, Building2, FileText, User, Check, Search, XCircle, AlertTriangle, History } from 'lucide-react';
import { REQUEST_STATUS } from '../../../shared/constants';
import { TIME_TYPES, TIME_TYPE_LABELS } from '../../../shared/utils/scheduleHelpers';

export default function StatusMode({ activeRequest, onBackToSearch, onCancel }) {
    // useEffect는 조건부 return 전에 호출되어야 함 (Rules of Hooks)
    React.useEffect(() => {
        if (activeRequest) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeRequest]);

    if (!activeRequest) return null;

    const statusInfo = Object.values(REQUEST_STATUS).find(s => s.id === activeRequest.status) || REQUEST_STATUS.PENDING;

    // Determine active step for Stepper
    let activeStep = 0;
    if (activeRequest.status === 'received') activeStep = 1;
    if (['success', 'failed', 'terminated'].includes(activeRequest.status)) activeStep = 3; // Completed

    return (
        <Transition mounted={true} transition="fade" duration={500} timingFunction="ease">
            {(styles) => (
                <Stack style={styles} w="100%" maw={720} mx="auto" gap="lg">
                    <Card padding={{ base: 'lg', sm: 'xl' }} radius="xl" shadow="xl" withBorder className="overflow-hidden relative bg-white" w="100%">
                        {/* Dynamic Background Circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/3 -z-10" />

                        <Stack gap="xl">
                            {/* Header */}
                            <Grid justify="space-between" align="stretch" gutter="xs">
                                <Grid.Col span="auto">
                                    <Stack gap={8}>
                                        <Badge
                                            size="xl"
                                            h={44}
                                            px={12}
                                            variant="filled"
                                            color={['failed', 'terminated'].includes(activeRequest.status) ? 'red' : statusInfo.badgeVariant === 'outline' ? 'gray' : 'hyundai-blue'}
                                            styles={{ label: { fontSize: '14px', fontWeight: 900, letterSpacing: '0.02em' } }}
                                        >
                                            {statusInfo.label}
                                        </Badge>
                                        <div className="min-w-0">
                                            <Title order={1} className="text-hyundai-navy font-black tracking-tighter tabular-nums truncate" style={{ fontSize: 'clamp(1.75rem, 8vw, 2.75rem)', lineHeight: 1.1 }}>
                                                {activeRequest.carNumber}
                                            </Title>
                                            <Text size="11px" c="dimmed" fw={700} tt="uppercase" ls="0.05em" mt={4} truncate>
                                                ID: {activeRequest.id}
                                            </Text>
                                        </div>
                                    </Stack>
                                </Grid.Col>
                                <Grid.Col span="content">
                                    <Card radius="lg" bg="gray.0" withBorder padding="md" className="shrink-0 h-full flex flex-col justify-center" shadow="sm" style={{ minWidth: '120px' }}>
                                        <Text size="12px" fw={900} c="dimmed" tt="uppercase" ta="center" mb={6} ls="0.02em">Partner</Text>
                                        <Group gap={8} justify="center" wrap="nowrap">
                                            <Building2 size={24} className="text-hyundai-navy" />
                                            <Text size="16px" fw={900} c="hyundai-navy" className="whitespace-nowrap">{activeRequest.partner}</Text>
                                        </Group>
                                    </Card>
                                </Grid.Col>
                            </Grid>

                            {/* Stepper */}
                            <Box py="lg" px="xs" bg="gray.0" style={{ borderRadius: 'var(--mantine-radius-xl)' }}>
                                <Stepper
                                    active={activeStep}
                                    size="xs"
                                    color="hyundai-blue"
                                    iconSize={28}
                                    allowNextStepsSelect={false}
                                    styles={{
                                        step: { padding: 0, flex: 1 },
                                        content: { display: 'none' },
                                        separator: {
                                            backgroundColor: 'var(--mantine-color-gray-3)',
                                            height: '2px',
                                            margin: '0 4px'
                                        },
                                        stepLabel: { fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' },
                                        stepDescription: { fontSize: '9px', fontWeight: 700, whiteSpace: 'nowrap' },
                                        stepBody: { marginLeft: '8px', gap: 0 }
                                    }}
                                >
                                    <Stepper.Step label="접수 대기" description="검토 중" />
                                    <Stepper.Step label={activeRequest.status === 'received' ? '조정 중' : '조정 완료'} description="일정 조율 중" />
                                    <Stepper.Step
                                        label={['failed', 'terminated'].includes(activeRequest.status) ? '조정 불가' : '완료'}
                                        description={['failed', 'terminated'].includes(activeRequest.status) ? '취소됨' : '방문 예정'}
                                        color={['failed', 'terminated'].includes(activeRequest.status) ? 'red' : 'hyundai-blue'}
                                        completedIcon={['failed', 'terminated'].includes(activeRequest.status) ? <XCircle size={14} /> : <Check size={14} />}
                                    />
                                </Stepper>
                            </Box>

                            {/* Details Grid */}
                            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                                {/* Row 1: SCHEDULE & REQUESTER */}
                                <Stack gap={4}>
                                    <Group gap={6}>
                                        <Calendar size={14} className="text-gray-400" />
                                        <Text size="xs" fw={900} c="dimmed" tt="uppercase">SCHEDULE</Text>
                                    </Group>
                                    <Card
                                        radius="lg"
                                        padding="lg"
                                        withBorder
                                        bg={activeRequest.status === 'success' ? 'teal.0' : 'white'}
                                        className={`transition-colors ${activeRequest.status === 'success' ? 'border-teal-200' : ''}`}
                                        h="100%"
                                    >
                                        {(() => {
                                            const schedule = activeRequest.status === 'success' ? activeRequest.confirmedSchedule : activeRequest.requestedSchedule;
                                            if (!schedule || !schedule.date) return <Text size="xl" fw={900}>-</Text>;

                                            const pureDate = schedule.date.includes('T') ? schedule.date.split('T')[0] : schedule.date;
                                            const [year, month, day] = pureDate.split('-').map(Number);
                                            const dateObj = new Date(year, month - 1, day);
                                            const days = ['일', '월', '화', '수', '목', '금', '토'];
                                            const dayOfWeek = days[dateObj.getDay()];
                                            const dateStr = `${pureDate}(${dayOfWeek})`;

                                            let timeStr = '';
                                            if (schedule.timeType === TIME_TYPES.AM) timeStr = TIME_TYPE_LABELS[TIME_TYPES.AM];
                                            else if (schedule.timeType === TIME_TYPES.PM) timeStr = TIME_TYPE_LABELS[TIME_TYPES.PM];
                                            else if (schedule.timeType === TIME_TYPES.SPECIFIC) timeStr = schedule.timeValue || '';

                                            return (
                                                <Stack gap={0} align="center" h="100%" justify="center">
                                                    <Text
                                                        size="xl"
                                                        fw={900}
                                                        c={activeRequest.status === 'failed' ? 'gray.4' : activeRequest.status === 'success' ? 'teal.8' : 'dark'}
                                                        td={activeRequest.status === 'failed' ? 'line-through' : undefined}
                                                        lh={1.2}
                                                        ta="center"
                                                    >
                                                        {dateStr}
                                                    </Text>
                                                    <Text
                                                        size="xl"
                                                        fw={900}
                                                        c={activeRequest.status === 'failed' ? 'gray.4' : activeRequest.status === 'success' ? 'teal.8' : 'dark'}
                                                        td={activeRequest.status === 'failed' ? 'line-through' : undefined}
                                                        lh={1.2}
                                                        ta="center"
                                                    >
                                                        {timeStr}
                                                    </Text>
                                                    {activeRequest.status === 'success' && (
                                                        <Text size="xs" fw={700} c="teal.6" tt="uppercase" mt={4} ta="center">Confirmed Visit</Text>
                                                    )}
                                                </Stack>
                                            );
                                        })()}
                                    </Card>
                                </Stack>

                                <Stack gap={4}>
                                    <Group gap={6}>
                                        <User size={14} className="text-gray-400" />
                                        <Text size="xs" fw={900} c="dimmed" tt="uppercase">REQUESTER</Text>
                                    </Group>
                                    <Card radius="lg" padding="lg" withBorder h="100%" display="flex" style={{ justifyContent: 'center', flexDirection: 'column' }}>
                                        <Text size="sm" fw={900}>{activeRequest.requester}</Text>
                                        <Text size="xs" c="dimmed" fw={700}>{activeRequest.requesterPhone}</Text>
                                    </Card>
                                </Stack>

                                {/* Row 2: MESSAGE & ADJUSTMENT DETAIL */}
                                <Stack gap={4}>
                                    <Group gap={6}>
                                        <FileText size={14} className="text-gray-400" />
                                        <Text size="xs" fw={900} c="dimmed" tt="uppercase">MESSAGE</Text>
                                    </Group>
                                    <Card radius="lg" padding="lg" bg="gray.0" withBorder h="100%">
                                        <Text size="sm" c="dimmed" fs="italic">
                                            "{activeRequest.reason || '입력된 사유가 없습니다.'}"
                                        </Text>
                                    </Card>
                                </Stack>

                                <Box h="100%">
                                    {(activeRequest.status === 'failed' || activeRequest.status === 'success' || activeRequest.status === 'terminated') ? (
                                        <Stack gap={4} h="100%">
                                            <Group gap={6}>
                                                <History size={14} className="text-gray-400" />
                                                <Text size="xs" fw={900} c="dimmed" tt="uppercase">ADJUSTMENT DETAIL</Text>
                                            </Group>

                                            {activeRequest.status === 'failed' && (
                                                <Card radius="lg" padding="lg" bg="red.0" withBorder style={{ borderColor: 'var(--mantine-color-red-2)' }} h="100%">
                                                    <Text size="sm" c="red.9" fw={700}>
                                                        "{activeRequest.rejectReason}"
                                                    </Text>
                                                </Card>
                                            )}

                                            {activeRequest.status === 'success' && (
                                                <Card radius="lg" padding="lg" bg="teal.0" withBorder style={{ borderColor: 'var(--mantine-color-teal-2)' }} h="100%">
                                                    <Text size="sm" c="teal.9" fw={700}>
                                                        일정 변경이 완료되었습니다. <br />
                                                        평가사가 변경된 시간에 방문 예정입니다.
                                                    </Text>
                                                </Card>
                                            )}

                                            {activeRequest.status === 'terminated' && (
                                                <Card radius="lg" padding="lg" bg="red.0" withBorder style={{ borderColor: 'var(--mantine-color-red-2)' }} h="100%">
                                                    <Text size="sm" c="red.9" fw={700}>
                                                        확인되지 않는 차량번호입니다. <br />
                                                        다시 확인 후 요청해주세요.
                                                    </Text>
                                                </Card>
                                            )}
                                        </Stack>
                                    ) : (
                                        <Box visibleFrom="md" h="100%" />
                                    )}
                                </Box>
                            </SimpleGrid>

                            {/* Footer Actions */}
                            <Grid pt="lg" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                                <Grid.Col span={6}>
                                    <Button
                                        fullWidth
                                        variant="default"
                                        size="lg"
                                        radius="xl"
                                        h={56}
                                        onClick={onBackToSearch}
                                        leftSection={<Search size={14} />}
                                        styles={{ label: { fontSize: '12px', fontWeight: 800 } }}
                                    >
                                        다른 차량 조회
                                    </Button>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Button
                                        fullWidth
                                        variant="outline"
                                        color="red"
                                        size="lg"
                                        radius="xl"
                                        h={56}
                                        disabled={['success', 'failed', 'terminated'].includes(activeRequest.status)}
                                        onClick={() => onCancel(activeRequest.id)}
                                        leftSection={<XCircle size={14} />}
                                        styles={{ label: { fontSize: '12px', fontWeight: 800 } }}
                                    >
                                        요청 취소
                                    </Button>
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Card>

                </Stack>
            )}
        </Transition>
    );
}
