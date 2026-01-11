import React from 'react';
import { Title, Text, Container, Notification, Transition, Box, Center, Stack } from '@mantine/core';
import { Check } from 'lucide-react';
import SearchMode from './SearchMode';
import FormMode from './FormMode';
import StatusMode from './StatusMode';
import { useCarmasterFlow } from '../hooks/useCarmasterFlow';

export default function CarmasterView() {
    const {
        viewMode,
        isSubmitting,
        isSuccess,
        carNumber,
        setCarNumber,
        activeRequest,
        formData,
        handleFieldChange,
        handleUpdateField, // keeping for compatibility, though form handling might change
        handleBackToSearch,
        handleSearch,
        handleCancelRequest,
        handleSubmit,
        searchError,
        recentCars
    } = useCarmasterFlow();

    return (
        <Container size="720px" px={{ base: 'xs', sm: 'md' }} py="xl" pos="relative">
            {/* Success Notification */}
            <Transition mounted={isSuccess} transition="slide-down" duration={400} timingFunction="ease">
                {(styles) => (
                    <Box style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 1000, pointerEvents: 'none' }}>
                        <Center style={styles}>
                            <Notification
                                icon={<Check size={20} />}
                                color="teal"
                                title="접수 완료"
                                radius="lg"
                                shadow="xl"
                                withCloseButton={false}
                                style={{ pointerEvents: 'auto' }}
                            >
                                <Text size="sm" fw={700}>요청이 성공적으로 접수되었습니다.</Text>
                                <Text size="xs" c="dimmed">상세 페이지로 이동합니다...</Text>
                            </Notification>
                        </Center>
                    </Box>
                )}
            </Transition>

            <Stack gap="xl">
                <Box ta="center" className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <Center mb="md">
                        <Box
                            px="md"
                            py={4}
                            bg="blue.0"
                            c="hyundai-blue"
                            style={{ borderRadius: 999 }}
                        >
                            <Text size="xs" fw={900} tt="uppercase" ls="0.1em">
                                {viewMode === 'SEARCH' ? 'Schedule Change' : viewMode === 'FORM' ? 'Request Form' : 'Status Tracking'}
                            </Text>
                        </Box>
                    </Center>

                    <Title order={1} size="h1" c="hyundai-navy" fw={900} ls="-0.03em" lh={1.1} mb="sm">
                        방문평가 일정변경 요청
                    </Title>

                    <Text c="dimmed" fw={500} maw={500} mx="auto" size="sm" lh={1.6}>
                        {viewMode === 'SEARCH' ? (
                            <>방문평가 예정 차량번호를 입력해 주세요.<br />(내차팔기 신청한 차량번호)</>
                        ) : viewMode === 'STATUS' ? (
                            activeRequest?.status === 'terminated'
                                ? '변경불가 : 확인되지 않는 차량번호입니다.'
                                : activeRequest?.status === 'failed'
                                    ? `변경불가 : [${activeRequest.detailedReason === 'failure_partner' ? '업체 사정으로 조정 불가한 케이스입니다.' : '고객 사정으로 조정 불가한 케이스입니다.'}]`
                                    : activeRequest?.status === 'received'
                                        ? '방문평가업체에서 일정조정을 진행하고 있습니다. (고객께 연락 중)'
                                        : '요청주신 내용을 협력사에서 확인 중입니다.'
                        ) : (
                            '원활한 일정변경 진행 위해, 아래 정보를 정확하게 입력해 주세요.'
                        )}
                    </Text>
                </Box>

                {viewMode !== 'STATUS' && (
                    <Box>
                        <SearchMode
                            viewMode={viewMode}
                            carNumber={carNumber}
                            setCarNumber={setCarNumber}
                            onSearch={handleSearch}
                            onBackToSearch={handleBackToSearch}
                            searchError={searchError}
                            recentCars={recentCars}
                        />

                        <Transition mounted={viewMode === 'FORM'} transition="slide-up" duration={500}>
                            {(styles) => (
                                <Box style={styles} mt="xl">
                                    <FormMode
                                        formData={formData}
                                        onFieldChange={handleFieldChange}
                                        onUpdateField={handleUpdateField}
                                        onSubmit={handleSubmit}
                                        isSubmitting={isSubmitting}
                                    />
                                </Box>
                            )}
                        </Transition>
                    </Box>
                )}

                {viewMode === 'STATUS' && (
                    <StatusMode
                        activeRequest={activeRequest}
                        onBackToSearch={handleBackToSearch}
                        onCancel={handleCancelRequest}
                    />
                )}
            </Stack>
        </Container>
    );
}
