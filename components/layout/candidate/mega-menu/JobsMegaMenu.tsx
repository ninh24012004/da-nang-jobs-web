import {
    Search,
    Bookmark,
    FileCheck,
    ThumbsUp,
    Building2,
    Crown,
} from "lucide-react";

import MegaMenuItem from "./MegaMenuItem";
import MegaMenuColumn from "./MegaMenuColumn";
import MegaMenuSectionTitle from "./MegaMenuSectionTitle";
import MegaMenuTextLink from "./MegaMenuTextLink";

export default function JobsMegaMenu() {
    return (
        <div className="absolute left-0 top-full pt-5 hidden group-hover:block">
            <div className="w-[980px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">

                <div className="grid grid-cols-[240px_1fr_1fr]">

                    {/* LEFT */}
                    <MegaMenuColumn bordered>

                        <MegaMenuSectionTitle title="VIỆC LÀM" />

                        <div className="space-y-0.5 mt-3">

                            <MegaMenuItem
                                href="/jobs"
                                label="Tìm việc làm"
                                icon={<Search />}
                                active
                            />

                            <MegaMenuItem
                                href="/saved-jobs"
                                label="Việc làm đã lưu"
                                icon={<Bookmark />}
                            />

                            <MegaMenuItem
                                href="/applied-jobs"
                                label="Việc làm đã ứng tuyển"
                                icon={<FileCheck />}
                            />

                            <MegaMenuItem
                                href="/matched-jobs"
                                label="Việc làm phù hợp"
                                icon={<ThumbsUp />}
                            />
                        </div>

                        <MegaMenuSectionTitle
                            title="CÔNG TY"
                            className="mt-8"
                        />

                        <div className="space-y-0.5 mt-3">
                            <MegaMenuItem
                                href="/companies"
                                label="Danh sách công ty"
                                icon={<Building2 />}
                            />
                        </div>
                    </MegaMenuColumn>

                    {/* CENTER */}
                    <MegaMenuColumn bordered>

                        <MegaMenuSectionTitle title="VIỆC LÀM THEO VỊ TRÍ" />

                        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-3">

                            {[
                                "Nhân viên kinh doanh",
                                "Kế toán",
                                "Marketing",
                                "Hành chính nhân sự",
                                "Chăm sóc khách hàng",
                                "Ngân hàng",
                                "IT",
                                "Lao động phổ thông",
                                "Senior",
                                "Kỹ sư xây dựng",
                                "Thiết kế đồ họa",
                                "Bất động sản",
                                "Giáo dục",
                                "Telesales",
                            ].map((item) => (
                                <MegaMenuTextLink
                                    key={item}
                                    href="/jobs"
                                    label={item}
                                />
                            ))}
                        </div>
                    </MegaMenuColumn>

                    {/* RIGHT */}
                    <MegaMenuColumn>

                        <MegaMenuSectionTitle title="VIỆC LÀM THEO LĨNH VỰC" />

                        <div className="space-y-1 mt-4">

                            {[
                                "Sản xuất",
                                "Bán lẻ - FMCG",
                                "IT - Phần mềm",
                                "Xây dựng",
                                "Giáo dục / Đào tạo",
                            ].map((item) => (
                                <MegaMenuTextLink
                                    key={item}
                                    href="/jobs"
                                    label={item}
                                />
                            ))}
                        </div>
                    </MegaMenuColumn>

                </div>
            </div>
        </div>
    );
}