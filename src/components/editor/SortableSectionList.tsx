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
import { useState } from "react";
import type { Section, SectionType } from "@/types/artifact";
import { GripVertical, Trash2 } from "lucide-react";

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  "rich-text": "Rich Text",
  "expandable-cards": "Cards",
  timeline: "Timeline",
  "tier-table": "Tier Table",
  "metric-dashboard": "Metrics",
  "data-viz": "Chart",
  "hub-mockup": "Hub",
  "guided-journey": "Journey",
};

interface SortableSectionListProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function SortableItem({
  section,
  isSelected,
  onSelect,
  onDelete,
}: {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-white/10 text-foreground"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
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
        <p className="text-sm font-medium truncate">{section.title}</p>
        <p className="text-xs opacity-60">
          {SECTION_TYPE_LABELS[section.type]}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirmDelete) {
            onDelete();
            setConfirmDelete(false);
          } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 2000);
          }
        }}
        className={`flex items-center transition-opacity ${
          confirmDelete
            ? "opacity-100 text-red-400"
            : "opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400"
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        {confirmDelete && <span className="text-xs ml-1">confirm?</span>}
      </button>
    </div>
  );
}

export function SortableSectionList({
  sections,
  selectedSectionId,
  onSelect,
  onDelete,
  onReorder,
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
        <div className="space-y-1">
          {sections.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              isSelected={section.id === selectedSectionId}
              onSelect={() => onSelect(section.id)}
              onDelete={() => onDelete(section.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
