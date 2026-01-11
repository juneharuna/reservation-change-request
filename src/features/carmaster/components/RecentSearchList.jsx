import React from 'react';
import { Group, Text, UnstyledButton, Paper } from '@mantine/core';
import { History } from 'lucide-react';

export default function RecentSearchList({ recentCars, onSelect }) {
    if (!recentCars || recentCars.length === 0) return null;

    return (
        <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-500">
            <Group gap={8} mb={8} align="center">
                <History size={12} className="text-gray-400" />
                <Text size="10px" fw={900} c="dimmed" tt="uppercase" ls="0.05em">
                    최근 입력 차량
                </Text>
            </Group>

            <Group gap={8} wrap="nowrap" className="overflow-x-auto pb-1 no-scrollbar">
                {recentCars.map((car) => (
                    <Paper
                        key={car}
                        component={UnstyledButton}
                        onClick={() => onSelect(car)}
                        shadow="xs"
                        withBorder
                        px={14}
                        py={6}
                        radius="md"
                        bg="gray.0"
                        className="hover:bg-gray-100 hover:border-hyundai-blue/30 transition-all active:scale-95 border-gray-100 shrink-0"
                    >
                        <Text size="13px" fw={800} c="hyundai-navy" className="tracking-wider">
                            {car}
                        </Text>
                    </Paper>
                ))}
            </Group>
        </div>
    );
}
