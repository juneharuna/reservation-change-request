import React, { useMemo } from 'react';
import {
    Container,
    Grid,
    Paper,
    Text,
    Group,
    Title,
    Table,
    Badge,
    RingProgress,
    Stack,
    ThemeIcon,
    ScrollArea,
    SimpleGrid
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useRequestStore } from '../../../core/store/useRequestStore';
import { CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

// Import Mantine Styles for this component scope
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';

// Constants
const PARTNER_NAMES = ['카뷰', 'CTS컴퍼니'];

export default function ManagerDashboard() {
    const { requests } = useRequestStore();

    // --- Statistics Calculation ---
    const stats = useMemo(() => {
        const now = new Date();
        const sixHoursMs = 6 * 60 * 60 * 1000;

        const initialStats = {
            '카뷰': { total: 0, processed: 0, distinctSuccess: 0, sumLeadTimeTotal: 0, sumLeadTimeProcess: 0, pending: 0, received: 0 },
            'CTS컴퍼니': { total: 0, processed: 0, distinctSuccess: 0, sumLeadTimeTotal: 0, sumLeadTimeProcess: 0, pending: 0, received: 0 },
            'Total': { total: 0, processed: 0, distinctSuccess: 0, sumLeadTimeTotal: 0, sumLeadTimeProcess: 0, pending: 0, received: 0 }
        };

        const delayedItems = [];

        requests.forEach(req => {
            const partnerName = PARTNER_NAMES.includes(req.partner) ? req.partner : 'Other';
            if (partnerName === 'Other') return;

            // Robust date parsing (handles hyphens, dots, etc.)
            const dateStr = req.createdAt ? String(req.createdAt).replace(/[.\s시분]/g, ' ').replace(/-/g, '/').trim() : null;
            const createdAt = dateStr ? new Date(dateStr) : new Date(0);

            if (isNaN(createdAt.getTime())) return; // Skip invalid dates

            initialStats[partnerName].total++;
            initialStats['Total'].total++;

            if (['pending', 'received'].includes(req.status)) {
                if (req.status === 'pending') {
                    initialStats[partnerName].pending++;
                    initialStats['Total'].pending++;
                } else {
                    initialStats[partnerName].received++;
                    initialStats['Total'].received++;
                }

                if (now - createdAt > sixHoursMs) {
                    delayedItems.push(req);
                }
            } else if (['success', 'failed', 'terminated', 'transferred'].includes(req.status)) {
                initialStats[partnerName].processed++;
                initialStats['Total'].processed++;

                if (req.status === 'success') {
                    initialStats[partnerName].distinctSuccess++;
                    initialStats['Total'].distinctSuccess++;
                }

                const parseSafe = (d) => {
                    if (!d) return null;
                    const clean = String(d).replace(/[.\s시분]/g, ' ').replace(/-/g, '/').trim();
                    const date = new Date(clean);
                    return isNaN(date.getTime()) ? null : date;
                };

                const processedAt = parseSafe(req.processedAt) || now;

                const diffTotal = processedAt - createdAt;
                if (diffTotal > 0) {
                    initialStats[partnerName].sumLeadTimeTotal += diffTotal;
                    initialStats['Total'].sumLeadTimeTotal += diffTotal;
                }

                const receivedAt = parseSafe(req.receivedAt);
                if (receivedAt) {
                    const diffProcess = processedAt - receivedAt;
                    if (diffProcess > 0) {
                        initialStats[partnerName].sumLeadTimeProcess += diffProcess;
                        initialStats['Total'].sumLeadTimeProcess += diffProcess;
                    }
                }
            }
        });

        const calcAvgHour = (ms, count) => count > 0 ? (ms / count / 3600000).toFixed(1) : 0;
        const calcRate = (success, total) => total > 0 ? Math.round((success / total) * 100) : 0;

        return {
            data: initialStats,
            delayed: delayedItems,
            summary: {
                carview: {
                    avgTotal: calcAvgHour(initialStats['카뷰'].sumLeadTimeTotal, initialStats['카뷰'].processed),
                    avgProcess: calcAvgHour(initialStats['카뷰'].sumLeadTimeProcess, initialStats['카뷰'].processed),
                    rate: calcRate(initialStats['카뷰'].distinctSuccess, initialStats['카뷰'].processed)
                },
                cts: {
                    avgTotal: calcAvgHour(initialStats['CTS컴퍼니'].sumLeadTimeTotal, initialStats['CTS컴퍼니'].processed),
                    avgProcess: calcAvgHour(initialStats['CTS컴퍼니'].sumLeadTimeProcess, initialStats['CTS컴퍼니'].processed),
                    rate: calcRate(initialStats['CTS컴퍼니'].distinctSuccess, initialStats['CTS컴퍼니'].processed)
                },
                total: {
                    avgTotal: calcAvgHour(initialStats['Total'].sumLeadTimeTotal, initialStats['Total'].processed),
                    avgProcess: calcAvgHour(initialStats['Total'].sumLeadTimeProcess, initialStats['Total'].processed),
                    rate: calcRate(initialStats['Total'].distinctSuccess, initialStats['Total'].processed)
                }
            },
            chartData: [
                {
                    partner: '카뷰',
                    '요청건수': initialStats['카뷰'].total,
                    '처리건수': initialStats['카뷰'].processed,
                    '평균처리시간(h)': parseFloat(calcAvgHour(initialStats['카뷰'].sumLeadTimeProcess, initialStats['카뷰'].processed))
                },
                {
                    partner: 'CTS컴퍼니',
                    '요청건수': initialStats['CTS컴퍼니'].total,
                    '처리건수': initialStats['CTS컴퍼니'].processed,
                    '평균처리시간(h)': parseFloat(calcAvgHour(initialStats['CTS컴퍼니'].sumLeadTimeProcess, initialStats['CTS컴퍼니'].processed))
                },
            ]
        };
    }, [requests]);


    return (
        <Container size="xl" py="xl" className="animate-in fade-in duration-700" data-testid="manager-dashboard">
            <header className="mb-10">
                <Title order={1} c="hyundai-navy" fw={900} ls="-0.03em">운영 대시보드</Title>
                <Text c="dimmed" size="lg" fw={500}>협력사별 퍼포먼스 및 실시간 현황 분석</Text>
            </header>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="lg" mb={50}>
                <StatsCard
                    title="전체 미접수"
                    value={stats.data.Total.pending}
                    icon={Clock}
                    color="orange"
                    desc="즉시 확인 필요"
                />
                <StatsCard
                    title="일정조정 진행중"
                    value={stats.data.Total.received}
                    icon={Clock}
                    color="blue"
                    desc="협력사 확인 완료"
                />
                <StatsCard
                    title="처리완료 (금일누적)"
                    value={stats.data.Total.processed}
                    icon={CheckCircle}
                    color="teal"
                    desc={`${stats.summary.total.rate}% 성공률`}
                />
                <StatsCard
                    title="평균 Lead Time"
                    value={`${stats.summary.total.avgTotal}h`}
                    icon={TrendingUp}
                    color="blue"
                    desc="요청부터 처리까지"
                />
                <StatsCard
                    title="평균 처리시간"
                    value={`${stats.summary.total.avgProcess}h`}
                    icon={TrendingUp}
                    color="indigo"
                    desc="접수부터 처리까지"
                />
            </SimpleGrid>

            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper shadow="sm" radius="md" p="xl" withBorder h="100%">
                        <Title order={3} mb="lg">협력사별 처리 현황</Title>
                        <BarChart
                            h={300}
                            data={stats.chartData}
                            dataKey="partner"
                            series={[
                                { name: '요청건수', color: 'gray.4' },
                                { name: '처리건수', color: 'indigo.6' },
                            ]}
                            tickLine="y"
                            gridAxis="y"
                            withLegend
                        />
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper shadow="sm" radius="md" p="xl" withBorder h="100%">
                        <Title order={3} mb="lg">업체별 처리 속도 비교</Title>
                        <Stack>
                            <Group justify="space-between">
                                <Text fw={700}>카뷰</Text>
                                <Badge size="lg" color="indigo">{stats.summary.carview.avgProcess}h</Badge>
                            </Group>
                            <Group justify="space-between">
                                <Text fw={700}>CTS컴퍼니</Text>
                                <Badge size="lg" color="teal">{stats.summary.cts.avgProcess}h</Badge>
                            </Group>
                            <Text size="xs" c="dimmed" mt="xs">* 확인(접수) 시점부터 최종 처리까지 소요된 시간의 평균입니다.</Text>
                        </Stack>

                        <Stack mt="xl">
                            <Title order={4}>조정 성공률</Title>
                            <Group grow align="center">
                                <Stack align="center" gap="xs">
                                    <RingProgress
                                        size={80}
                                        roundCaps
                                        thickness={8}
                                        sections={[{ value: stats.summary.carview.rate, color: 'indigo' }]}
                                        label={<Text ta="center" size="xs" fw={700}>{stats.summary.carview.rate}%</Text>}
                                    />
                                    <Text size="sm" fw={700}>카뷰</Text>
                                </Stack>
                                <Stack align="center" gap="xs">
                                    <RingProgress
                                        size={80}
                                        roundCaps
                                        thickness={8}
                                        sections={[{ value: stats.summary.cts.rate, color: 'teal' }]}
                                        label={<Text ta="center" size="xs" fw={700}>{stats.summary.cts.rate}%</Text>}
                                    />
                                    <Text size="sm" fw={700}>CTS컴퍼니</Text>
                                </Stack>
                            </Group>
                        </Stack>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Paper shadow="sm" radius="md" p="xl" withBorder className="border-l-4 border-l-rose-500">
                        <Group mb="md">
                            <ThemeIcon color="red" variant="light" size="lg">
                                <AlertTriangle size={20} />
                            </ThemeIcon>
                            <div>
                                <Title order={3}>장기 지연 요청 (6시간 이상)</Title>
                                <Text size="sm" c="dimmed">요청 접수 후 6시간이 경과하도록 처리가 완료되지 않은 건입니다.</Text>
                            </div>
                        </Group>

                        {stats.delayed.length > 0 ? (
                            <ScrollArea h={250}>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>ID</Table.Th>
                                            <Table.Th>차량번호</Table.Th>
                                            <Table.Th>협력사</Table.Th>
                                            <Table.Th>요청자</Table.Th>
                                            <Table.Th>요청시간</Table.Th>
                                            <Table.Th>상태</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {stats.delayed.map((req) => (
                                            <Table.Tr key={req.id}>
                                                <Table.Td><Text size="xs" c="dimmed">{req.id}</Text></Table.Td>
                                                <Table.Td fw={700}>{req.carNumber}</Table.Td>
                                                <Table.Td>{req.partner}</Table.Td>
                                                <Table.Td>{req.requester}</Table.Td>
                                                <Table.Td>{req.createdAt}</Table.Td>
                                                <Table.Td>
                                                    <Badge color={req.status === 'pending' ? 'orange' : 'blue'}>
                                                        {req.status === 'pending' ? '미확인' : '처리중'}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        ) : (
                            <Text c="dimmed" py="xl" ta="center">지연된 요청이 없습니다. 깨끗하네요! ✨</Text>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
}

function StatsCard({ title, value, icon, color, desc }) {
    const IconElement = icon;
    return (
        <Paper withBorder p="md" radius="md" shadow="xs">
            <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {title}
                </Text>
                <ThemeIcon color={color} variant="light">
                    <IconElement size={18} />
                </ThemeIcon>
            </Group>

            <Group align="flex-end" gap="xs" mt={25}>
                <Text fw={900} size="2rem" lh={1}>
                    {value}
                </Text>
            </Group>

            <Text size="xs" c="dimmed" mt={7}>
                {desc}
            </Text>
        </Paper>
    );
}
