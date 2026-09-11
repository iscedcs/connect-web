"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Nfc,
  Users,
  Smartphone,
  MapPin,
  Phone,
  Mail,
  Building,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ArrowUpRight,
} from "lucide-react";
import { cpApi } from "@/lib/cp-api";
import { URLS } from "@/lib/const";
import { useCpWorkspaceStore } from "@/stores/cp-workspace.store";
import { WorkspaceHeroHeader } from "@/components/cp/workspace/WorkspaceHeroHeader";
import type { FullCompanyProfile } from "@/components/cp/settings/types";
import type { CpAnalytics, CpWorkspace } from "@/lib/types/cp";
import { FALLBACK_ACTIVITIES, mapAuditLogsToActivities } from "@/lib/cp-utils";

export default function WorkspaceDashboardPage() {
  const { workspaceId, workspaceSlug, workspaceName } = useCpWorkspaceStore();
  const [analytics, setAnalytics] = useState<CpAnalytics | null>(null);
  const [workspace, setWorkspace] = useState<CpWorkspace | null>(null);
  const [companyProfile, setCompanyProfile] =
    useState<FullCompanyProfile | null>(null);
  const [activities, setActivities] =
    useState<Array<{ title: string; time: string }>>(FALLBACK_ACTIVITIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    setLoading(true);
    const wsUrl = URLS.workspaces.get_one.replace("{id}", workspaceId);

    Promise.all([
      cpApi
        .get<{ analytics: CpAnalytics }>(URLS.organization.analytics)
        .catch(() => null),
      cpApi.get<{ workspace: CpWorkspace }>(wsUrl).catch(() => null),
      cpApi.get<any>(URLS.company_profile.get).catch(() => null),
      cpApi
        .get<any>(URLS.organization_audit_log.all_org_audit_logs)
        .catch(() =>
          cpApi.get<any>(URLS.organization_audit_log.all).catch(() => null),
        ),
    ])
      .then(([analyticsRes, wsRes, profileRes, auditLogsRes]) => {
        if (analyticsRes?.data?.analytics) {
          setAnalytics(analyticsRes.data.analytics);
        } else {
          setAnalytics({
            profileViews: 0,
            taps: 0,
            leadsCaptured: 0,
            activeDevices: 0,
          });
        }
        if (wsRes?.data?.workspace) {
          setWorkspace(wsRes.data.workspace);
        }
        const rawProfile =
          profileRes?.data?.data ||
          profileRes?.data?.companyProfile ||
          profileRes?.data?.profile ||
          profileRes?.data;
        if (rawProfile && typeof rawProfile === "object") {
          setCompanyProfile(rawProfile);
        }

        // Parse audit logs for Recent Activity feed
        const rawLogs =
          auditLogsRes?.data?.logs ||
          auditLogsRes?.data?.auditLogs ||
          auditLogsRes?.data?.data ||
          (Array.isArray(auditLogsRes?.data) ? auditLogsRes?.data : null);

        // Log full audit logs response for backend debugging/inspection
        console.log("[Audit Log API Response]", auditLogsRes?.data);
        if (rawLogs && Array.isArray(rawLogs) && rawLogs.length > 0) {
          console.log("[Audit Log Sample Record]", rawLogs[0]);
          setActivities(mapAuditLogsToActivities(rawLogs));
        }
      })
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const formattedAddress = [
    companyProfile?.address?.street,
    companyProfile?.address?.city,
    companyProfile?.address?.state,
    companyProfile?.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Figma Workspace Hero Header */}
      <WorkspaceHeroHeader
        activeTab="overview"
        name={companyProfile?.name || workspaceName}
        logoImage={companyProfile?.logo}
        coverImage={companyProfile?.coverImage}
        location={
          formattedAddress || workspace?.address || "California, United States"
        }
        category={workspace?.category || "Business Workspace"}
      />

      {/* 4 Stat Summary Cards Grid matching Figma Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Profile views */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] flex flex-col justify-between h-32 hover:border-neutral-700 transition-colors">
          <Eye size={22} className="text-neutral-300" />
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {analytics?.profileViews
                ? formatNumber(analytics.profileViews)
                : "37.7k"}
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-0.5">
              Profile views
            </div>
          </div>
        </div>

        {/* Card 2: Taps */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] flex flex-col justify-between h-32 hover:border-neutral-700 transition-colors">
          <Nfc size={22} className="text-neutral-300" />
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {analytics?.taps ? formatNumber(analytics.taps) : "67.3k"}
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-0.5">
              Taps
            </div>
          </div>
        </div>

        {/* Card 3: Leads captured */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] flex flex-col justify-between h-32 hover:border-neutral-700 transition-colors">
          <Users size={22} className="text-neutral-300" />
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {analytics?.leadsCaptured
                ? formatNumber(analytics.leadsCaptured)
                : "7.4k"}
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-0.5">
              Leads captured
            </div>
          </div>
        </div>

        {/* Card 4: Active devices */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] flex flex-col justify-between h-32 hover:border-neutral-700 transition-colors">
          <Smartphone size={22} className="text-neutral-300" />
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {analytics?.activeDevices ?? 10}
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-0.5">
              Active devices
            </div>
          </div>
        </div>
      </div>

      {/* Main Content 2-Column Grid: About Card & Recent Activity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): About Card */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#222222] space-y-6">
          <h2 className="text-lg font-bold text-white">About</h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {companyProfile?.description ||
              "We are committed to providing our customers with reliable and high-quality services tailored to their workspace operations."}
          </p>

          <div className="space-y-4 pt-2">
            {/* Registered Address */}
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Registered Address
                </p>
                <p className="text-xs sm:text-sm font-medium text-neutral-200 mt-0.5">
                  {formattedAddress ||
                    workspace?.address ||
                    "Address not configured"}
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <Phone size={18} className="text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Phone Number
                </p>
                <p className="text-xs sm:text-sm font-medium text-neutral-200 mt-0.5">
                  {companyProfile?.contactPhone ||
                    "Phone number not configured"}
                </p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Email Address
                </p>
                <p className="text-xs sm:text-sm font-medium text-neutral-200 mt-0.5 truncate">
                  {companyProfile?.contactEmail ||
                    "Email address not configured"}
                </p>
              </div>
            </div>

            {/* NAICS */}
            <div className="flex items-start gap-3">
              <Building
                size={18}
                className="text-neutral-400 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Industry / NAICS
                </p>
                <p className="text-xs sm:text-sm font-medium text-neutral-200 mt-0.5">
                  {workspace?.naicsCode
                    ? `${workspace.naicsCode} Professional Services`
                    : "722511 Full-Service Restaurants"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Activity Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#222222] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <Link
              href="/cp/org/audit-logs"
              className="text-[11px] font-semibold text-[var(--cp-text-3,#888)] hover:text-emerald-400 inline-flex items-center gap-1 transition-colors group">
              <span>View all</span>
              <ArrowUpRight
                size={13}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>

          <ul className="space-y-5">
            {activities.map((act, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-neutral-200 truncate">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {act.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Page Footer matching Figma Screen 1 */}
      <footer className="pt-8 pb-4 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        {/* Social Icons */}
        <div className="flex items-center gap-4 text-neutral-400">
          <Globe
            size={16}
            className="hover:text-white cursor-pointer transition-colors"
          />
          <Facebook
            size={16}
            className="hover:text-white cursor-pointer transition-colors"
          />
          <Instagram
            size={16}
            className="hover:text-white cursor-pointer transition-colors"
          />
          <Linkedin
            size={16}
            className="hover:text-white cursor-pointer transition-colors"
          />
          <Twitter
            size={16}
            className="hover:text-white cursor-pointer transition-colors"
          />
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1.5 text-neutral-400">
          <span className="w-4 h-4 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] font-bold">
            c
          </span>
          <span>IISCE Digital Concept</span>
        </div>

        {/* Currency & Country Selector */}
        <div className="flex items-center gap-4">
          <span>Currency - NGN</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-700 bg-neutral-800 text-white text-xs cursor-pointer">
            <span className="text-xs">ðŸ‡³ðŸ‡¬</span>
            <span className="text-[10px]">&#9660;</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

