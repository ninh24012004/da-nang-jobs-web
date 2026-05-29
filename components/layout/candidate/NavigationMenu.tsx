import NavigationItem from "./NavigationItem";
import JobsMegaMenu from "./mega-menu/JobsMegaMenu";

const NAV_ITEMS = [
    {
        label: "Việc làm",
        href: "/jobs",
        dropdown: true,
    },
    {
        label: "Công ty",
        href: "/candidate/companies",
    },
    {
        label: "Hồ sơ & CV",
        href: "/candidate/profile?tab=profile",
    },
];

export default function NavigationMenu() {
    return (
        <nav className="hidden md:flex gap-2 lg:gap-4 ml-6">
            {NAV_ITEMS.map((item) => (
                <NavigationItem
                    key={item.label}
                    label={item.label}
                    href={item.href}
                    hasDropdown={item.dropdown}
                >
                    {item.label === "Việc làm" && (
                        <JobsMegaMenu />
                    )}
                </NavigationItem>
            ))}
        </nav>
    );
}