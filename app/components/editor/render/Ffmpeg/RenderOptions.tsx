import { useAppSelector } from '@/app/store';
import { useAppDispatch } from '@/app/store';
import { setResolution, setQuality, setSpeed } from '@/app/store/slices/projectSlice';
export default function RenderOptions() {
    const { exportSettings } = useAppSelector(state => state.projectState);
    const dispatch = useAppDispatch();

    return (
        <div className="relative">
            <div className="flex items-center justify-center z-50">
                <div className="p-2 rounded-lg w-11/12">
                    <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-4">
                            <div>

                                {/* Resolution Setting */}
                                <label className="text-l font-bold mb-2 text-white">Resolution</label>
                                <select
                                    value={exportSettings.resolution}
                                    onChange={(e) => dispatch(setResolution(e.target.value))}
                                    className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                >
                                    <option value="480p">480p</option>
                                    <option value="720p">720p</option>
                                    <option value="1080p">1080p (Full HD)</option>
                                    {/* <option value="2K">2K</option> */}
                                    {/* <option value="4K">4K (Ultra HD)</option> */}
                                </select>
                            </div>

                            {/* Quality Setting - OPTIMIZED FOR SPEED */}
                            <div>
                                <label className="text-l font-bold mb-2 text-white">Quality</label>
                                <select
                                    value={exportSettings.quality}
                                    onChange={(e) => dispatch(setQuality(e.target.value))}
                                    className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                >
                                    <option value="high">High Quality - Fast (Recommended)</option>
                                    <option value="medium">Medium Quality - Fastest</option>
                                    <option value="ultra">Best Quality - Slower</option>
                                </select>
                            </div>
                        </div>

                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        <p>Current settings: {exportSettings.resolution} at {exportSettings.quality} quality (fastest processing)</p>
                    </div>
                </div>
            </div>


        </div>
    );
}