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
import { GripVertical, Trash2, Plus } from "lucide-react";

interface ItemManagerProps<T> {
  items: T[];
  getItemId: (item: T, index: number) => string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addLabel: string;
  minItems?: number;
  maxItems?: number;
}

function SortableRow({
  id,
  index,
  children,
  onRemove,
  canRemove,
}: {
  id: string;
  index: number;
  children: React.ReactNode;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-3 opacity-0 group-hover:opacity-50 shrink-0 cursor-grab touch-none transition-opacity"
        tabIndex={-1}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
      {canRemove && (
        <button
          onClick={onRemove}
          className="mt-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400 transition-opacity shrink-0"
          tabIndex={-1}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function ItemManager<T>({
  items,
  getItemId,
  onAdd,
  onRemove,
  onReorder,
  renderItem,
  addLabel,
  minItems = 0,
  maxItems,
}: ItemManagerProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const canRemove = items.length > minItems;
  const canAdd = maxItems === undefined || items.length < maxItems;

  const itemIds = items.map((item, i) => getItemId(item, i));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, i) => (
            <SortableRow
              key={itemIds[i]}
              id={itemIds[i]}
              index={i}
              onRemove={() => onRemove(i)}
              canRemove={canRemove}
            >
              {renderItem(item, i)}
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>

      {canAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-white/5"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}
