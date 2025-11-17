"use client";

import LinkListSkeleton from "@/components/shared/skeleton/link-list-skeleton";
import LinkCard from "./connect-links-card";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { SortableItem } from "@/components/shared/sortable-item";

export default function LinkList({
  links,
  loading,
  profileId,
  accessToken,
  onUpdated,
  showRestore = false,
  selectionMode = false,
  selectedIds = [],
  toggleSelect,
  reorderMode = false,
  onReorderComplete,
}: {
  links: any[];
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectionMode?: boolean;
  selectedIds?: string[];
  toggleSelect?: (id: string) => void;
  reorderMode?: boolean;
  onReorderComplete?: (items: any[]) => void;
}) {
  if (loading) return <LinkListSkeleton />;

  if (!links?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No links yet. Click <strong>Add new</strong> to get started.
      </div>
    );

  const USE_GROUPING = CONNECT_DEV_FEATURES.links.enableAutoCategoryGrouping;
  const SHOW_GROUP_HEADERS = CONNECT_DEV_FEATURES.links.enableCategoryUI;

  const grouped = USE_GROUPING
    ? links.reduce((acc: any, link: any) => {
        const cat = link.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(link);
        return acc;
      }, {})
    : { All: links };

  if (reorderMode) {
    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEnd = (event: any) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = links.findIndex((x) => x.id === active.id);
      const newIndex = links.findIndex((x) => x.id === over.id);

      const newOrder = arrayMove(links, oldIndex, newIndex);
      onReorderComplete?.(newOrder);
    };
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <SortableContext items={links} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {links.map((l) => (
              <SortableItem key={l.id} id={l.id}>
                <LinkCard
                  link={l}
                  profileId={profileId}
                  accessToken={accessToken}
                  onUpdated={onUpdated}
                  showRestore={showRestore}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]: any) => (
        <div key={category}>
          {SHOW_GROUP_HEADERS && (
            <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">
              {category}
            </p>
          )}

          <div className="space-y-3">
            {items.map((l: any) => (
              <LinkCard
                key={l.id}
                link={l}
                profileId={profileId}
                accessToken={accessToken}
                onUpdated={onUpdated}
                showRestore={showRestore}
                selected={selectedIds.includes(l.id)}
                selectionMode={selectionMode}
                toggleSelect={toggleSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
