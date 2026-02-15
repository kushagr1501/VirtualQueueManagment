const Bone = ({ className = "" }) => (
    <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
);

export function PlaceCardSkeleton() {
    return (
        <div className="place-card block">
            <Bone className="aspect-[4/3] rounded-2xl mb-6" />
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <Bone className="h-6 w-3/4 mb-2" />
                    <Bone className="h-4 w-1/2" />
                </div>
                <Bone className="w-6 h-6 rounded" />
            </div>
            <div className="mt-4 flex items-center gap-6 border-t border-black/5 pt-4">
                <div className="flex flex-col gap-1">
                    <Bone className="h-3 w-14" />
                    <Bone className="h-6 w-8" />
                </div>
                <div className="flex flex-col gap-1">
                    <Bone className="h-3 w-14" />
                    <Bone className="h-6 w-12" />
                </div>
            </div>
        </div>
    );
}

export function QueuePageSkeleton() {
    return (
        <div className="min-h-screen bg-[#F2F2F2] text-black font-sans flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-8">
                    <Bone className="h-10 w-56 mx-auto mb-3" />
                    <Bone className="h-6 w-36 mx-auto rounded-full" />
                </div>

                <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-lg mb-10">
                    <div className="bg-white flex-1 p-8 md:p-12 space-y-8">
                        <div className="flex justify-between border-b border-gray-100 pb-6">
                            <div className="space-y-2">
                                <Bone className="h-3 w-20" />
                                <Bone className="h-7 w-40" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <Bone className="h-3 w-24 mb-2" />
                                <Bone className="h-12 w-full rounded-lg" />
                            </div>
                            <div>
                                <Bone className="h-3 w-20 mb-2" />
                                <Bone className="h-12 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-96 bg-gray-900 p-10 flex flex-col items-center justify-center gap-6">
                        <Bone className="h-3 w-20 !bg-gray-700" />
                        <Bone className="h-4 w-48 !bg-gray-700" />
                        <Bone className="h-14 w-full rounded-xl !bg-gray-700" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div className="space-y-2">
                            <Bone className="h-5 w-36" />
                            <Bone className="h-3 w-52" />
                        </div>
                        <Bone className="h-6 w-20 rounded-full" />
                    </div>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
                            <Bone className="h-5 w-8" />
                            <Bone className="h-5 w-32 flex-1" />
                            <Bone className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function TicketCardSkeleton() {
    return (
        <div className="queue-card bg-white rounded-3xl border border-black/5 overflow-hidden p-8">
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1 space-y-2">
                    <Bone className="h-3 w-20" />
                    <Bone className="h-8 w-48" />
                    <Bone className="h-3 w-32" />
                </div>
                <div className="text-center space-y-1">
                    <Bone className="h-3 w-14" />
                    <Bone className="h-10 w-14" />
                </div>
            </div>
            <div className="flex items-center gap-8 py-6 border-t border-dashed border-gray-200">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-1">
                        <Bone className="h-3 w-14" />
                        <Bone className="h-5 w-16" />
                    </div>
                ))}
            </div>
            <div className="flex gap-4 pt-4">
                <Bone className="h-14 flex-1 rounded-xl" />
                <Bone className="h-14 w-14 rounded-xl" />
            </div>
        </div>
    );
}

export function AdminQueueSkeleton() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                    <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Bone className="h-4 w-32" />
                        <Bone className="h-3 w-20" />
                    </div>
                    <Bone className="h-8 w-20 rounded-lg" />
                    <Bone className="h-8 w-8 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function AnalyticsSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Bone className="h-10 w-20 rounded-xl" />
                        <div className="space-y-1">
                            <Bone className="h-5 w-32" />
                            <Bone className="h-3 w-20" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Bone className="h-10 w-32 rounded-xl" />
                        <Bone className="h-10 w-28 rounded-xl" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
                            <Bone className="w-10 h-10 rounded-xl mb-3" />
                            <Bone className="h-3 w-16 mb-2" />
                            <Bone className="h-8 w-20" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
                            <Bone className="h-5 w-36 mb-6" />
                            <Bone className="h-[250px] w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Bone;
