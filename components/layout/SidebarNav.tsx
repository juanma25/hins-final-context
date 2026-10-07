// components/layout/SidebarNav.tsx — sidebar único (logo + menú dirigido por datos + usuario)
"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navItemPath, type NavItem } from "@/lib/admin-nav"

export interface SidebarUser {
  name: string
  email: string
  avatar: string
}

interface SidebarNavProps extends ComponentProps<typeof Sidebar> {
  groupLabel: string
  items: NavItem[]
  user: SidebarUser
}

export function SidebarNav({ groupLabel, items, user, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          {/* Logo apaisado - visible cuando expandido */}
          <svg
            className="h-6 w-auto group-data-[collapsible=icon]:hidden shrink-0"
            viewBox="0 0 89 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M89.0044 1.20013e-06H0V26.3239H89.0044V25.1736V1.15011V1.20013e-06ZM87.8543 25.1736H1.15029V1.15011H87.8543V25.1736Z" fill="#7EA54A" />
            <path d="M25.8713 6.54725V19.7764H21.3526V14.0585H10.1876V19.7764H5.66885V6.54725H10.1876V11.9455H21.3526V6.54725" fill="#7EA54A" />
            <path d="M30.0568 19.7766H34.5757V6.54742H30.0568V19.7766Z" fill="#7EA54A" />
            <path d="M60.9004 6.54725V19.7764H53.2423L46.4389 12.5171C46.1009 12.1557 45.5723 11.5223 44.8507 10.6174L44.0837 9.66804L43.3339 8.71847H43.1595L43.2282 9.59049L43.2815 10.4527L43.3159 12.1878V19.7764H38.7971V6.54725H46.4566L52.6497 13.2536C53.1961 13.8486 53.8291 14.5685 54.5507 15.4152L55.4584 16.491L56.3653 17.5763H56.5225L56.4692 16.7236L56.4174 15.8704L56.3828 14.1652V6.54725" fill="#7EA54A" />
            <path d="M82.7595 10.4047H78.3464C78.3226 10.2821 78.3122 10.1914 78.3122 10.1332C78.2065 9.39034 77.9104 8.92316 77.422 8.73257C76.9338 8.54217 75.7816 8.44697 73.9674 8.44697C71.8271 8.44697 70.4288 8.55663 69.7721 8.77651C69.1144 8.99621 68.7861 9.45794 68.7861 10.1623C68.7861 10.9954 69.0541 11.4962 69.5885 11.6646C70.1242 11.8327 71.8912 11.9619 74.8918 12.052C78.4386 12.1621 80.7334 12.4432 81.775 12.8951C82.8154 13.348 83.3355 14.2878 83.3355 15.7158C83.3355 17.4732 82.7253 18.6087 81.5034 19.1222C80.2827 19.636 77.5904 19.8929 73.4268 19.8929C69.6822 19.8929 67.1957 19.6409 65.9692 19.1365C64.7413 18.6329 64.1286 17.612 64.1286 16.0743L64.111 15.5895H68.5077L68.5242 15.8704C68.5242 16.7948 68.8156 17.36 69.3968 17.5669C69.9785 17.7735 71.5665 17.8767 74.1595 17.8767C76.1836 17.8767 77.4744 17.7577 78.0323 17.5183C78.5905 17.2794 78.8701 16.7264 78.8701 15.8608C78.8701 15.2214 78.6583 14.7969 78.2328 14.5862C77.8083 14.3765 76.8923 14.2492 75.4855 14.2037L72.9908 14.1166C69.2223 13.994 66.8155 13.7029 65.7686 13.244C64.7212 12.7855 64.1987 11.8002 64.1987 10.2879C64.1987 8.74384 64.8292 7.71522 66.0912 7.20128C67.3536 6.68754 69.8743 6.43104 73.6534 6.43104C77.2359 6.43104 79.6488 6.66688 80.893 7.13857C82.1374 7.61007 82.7595 8.53109 82.7595 9.90052" fill="#7EA54A" />
          </svg>

          {/* Isotipo square - visible cuando colapsado */}
          <svg
            className="hidden group-data-[collapsible=icon]:block h-8 w-8 shrink-0"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="48" rx="4" fill="#7EA54A" />
            <path d="M40 12H8V37L40 37V35.9075V13.0923V12ZM38.8849 35.9075H9.11529V13.0923H38.8849V35.9075Z" fill="#F5F5F5" />
            <path d="M34.2025 18V31.2292H29.6837V25.5113H18.5188V31.2292H14V18H18.5188V23.3983H29.6837V18" fill="#F5F5F5" />
          </svg>
        </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === navItemPath(item)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
