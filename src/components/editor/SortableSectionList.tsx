"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import type { Section } from "@/types/artifact";
import { SECTION_TYPE_LABELS } from "@/types/artifact";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";

function getItemCount(section: Section): string | null {
  switch (section.type) {
    case "expandable-cards":
      return `${section.content.cards.length} cards`;
    case "timeline":
      return `${section.content.steps.length} steps`;
    case "metric-dashboard":
      return `${section.content.metrics.length} metrics`;
    case "guided-journey":
      return `${section.content.events.length} events`;
    case "tier-table":
      return `${section.content.columns.length} tiers`;
    case "hub-mockup": {
      const nodeCount = section.content.layers
        ? section.content.layers.reduce((sum: number, l: { nodes: unknown[] }) => sum + l.nodes.length, 0)
        : section.content.nodes?.length ?? 0;
      return `${nodeCount} nodes`;
    }
    default:
      return null;
  }
}


function InsertDivider({ onClick }: { onClick: () => void }) {
  return (
    <div className="group/insert relative flex items-center py-0.5">
      <div className="absolute inset-x-3 h-px bg-transparent group-hover/insert:bg-accent/40 transition-colors" />
      <button
        onClick={onClick}
        className="relative mx-auto flex items-center justify-center w-5 h-5 rounded-full border border-transparent text-transparent group-hover/insert:border-accent/40 group-hover/insert:text-accent/70 hover:!border-accent hover:!text-accent hover:!bg-accent/10 transition-all"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

interface SortableSectionListProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelect: (_id: string) => void;
  onDelete: (_id: string) => void;
  onDuplicate: (_id: string) => void;
  onReorder: (_fromIndex: number, _toIndex: number) => void;
  onInsertAt?: (_position: number) => void;
}

function SortableItem({
  section,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  useEffect(() => {
    if (!confirmDelete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmDelete(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [confirmDelete]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center gap-2 pl-2 pr-3 py-2 rounded-lg cursor-pointer transition-colors border-l-2 ${
        isSelected
          ? "bg-accent/5 text-foreground border-accent"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-transparent"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-50 shrink-0 cursor-grab touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-2">{section.title}</p>
        <p className="text-xs opacity-80">
          {SECTION_TYPE_LABELS[section.type]}
          {(() => {
            const count = getItemCount(section);
            return count ? <span className="ml-1.5 opacity-80">&middot; {count}</span> : null;
          })()}
        </p>
      </div>
      {!confirmDelete && (
        <button
          aria-label="Duplicate section"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-accent transition-opacity"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        aria-label={confirmDelete ? "Confirm delete" : "Delete section"}
        onClick={(e) => {
          e.stopPropagation();
          if (confirmDelete) {
            onDelete();
            setConfirmDelete(false);
          } else {
            setConfirmDelete(true);
          }
        }}
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 transition-all ${
          confirmDelete
            ? "opacity-100 bg-red-500/10 text-red-400 border border-red-500/20"
            : "opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400 border border-transparent"
        }`}
      >
        <Trash2 className="w-3.5 h-3.5 shrink-0" />
        {confirmDelete && <span className="text-xs whitespace-nowrap">Confirm delete?</span>}
      </button>
    </div>
  );
}

export function SortableSectionList({
  sections,
  selectedSectionId,
  onSelect,
  onDelete,
  onDuplicate,
  onReorder,
  onInsertAt,
}: SortableSectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    onReorder(oldIndex, newIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0">
          {onInsertAt && <InsertDivider onClick={() => onInsertAt(0)} />}
          {sections.map((section, index) => (
            <div key={section.id}>
              <SortableItem
                section={section}
                isSelected={section.id === selectedSectionId}
                onSelect={() => onSelect(section.id)}
                onDelete={() => onDelete(section.id)}
                onDuplicate={() => onDuplicate(section.id)}
              />
              {onInsertAt && <InsertDivider onClick={() => onInsertAt(index + 1)} />}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
