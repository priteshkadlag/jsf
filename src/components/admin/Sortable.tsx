"use client";

import { createContext, use, useId, type CSSProperties, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/*
 * Drag-and-drop reordering for every list in the admin. Grab the ⠿ handle (or a photo) with the
 * mouse, press and hold it on a phone, or focus it and use Space + arrow keys + Space.
 *
 * Each item shares its drag wiring through context, so <DragHandle /> or <DragArea> can sit
 * anywhere inside the item.
 */

type ItemCtx = { attributes: DraggableAttributes; listeners: DraggableSyntheticListeners };
const SortableItemContext = createContext<ItemCtx | null>(null);
/** Kept in its own context: it is a ref callback, and lint treats objects holding refs as refs. */
const ActivatorContext = createContext<((el: HTMLElement | null) => void) | null>(null);

type Layout = "list" | "grid" | "row";
const strategies = { list: verticalListSortingStrategy, grid: rectSortingStrategy, row: horizontalListSortingStrategy };

function Item({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 20 : undefined,
  };
  return (
    <li ref={setNodeRef} style={style} className={`${className ?? ""} ${isDragging ? "opacity-90 shadow-xl ring-2 ring-emerald-500" : ""}`}>
      <ActivatorContext value={setActivatorNodeRef}>
        <SortableItemContext value={{ attributes, listeners }}>{children}</SortableItemContext>
      </ActivatorContext>
    </li>
  );
}

export function SortableList<T>({
  items,
  onChange,
  layout = "list",
  className,
  itemClassName,
  children,
}: {
  items: T[];
  onChange: (next: T[], move: { from: number; to: number }) => void;
  layout?: Layout;
  className?: string;
  itemClassName?: string;
  children: (item: T, index: number) => ReactNode;
}) {
  const dndId = useId();
  const sensors = useSensors(
    // A small movement threshold, so clicks on buttons inside an item still work.
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // Press-and-hold on touch screens, so the page still scrolls normally.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  // Positions are the ids: the items are controlled, so their content simply follows the new order.
  const ids = items.map((_, i) => String(i));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = Number(active.id);
    const to = Number(over.id);
    onChange(arrayMove(items, from, to), { from, to });
  };

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={strategies[layout]}>
        <ul className={className}>
          {items.map((item, i) => (
            <Item key={ids[i]} id={ids[i]} className={itemClassName}>
              {children(item, i)}
            </Item>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

/** The ⠿ grab handle. Place it anywhere inside a SortableList item. */
export function DragHandle({ label, className = "" }: { label: string; className?: string }) {
  const ctx = use(SortableItemContext);
  const activator = use(ActivatorContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      ref={activator}
      {...ctx.attributes}
      {...ctx.listeners}
      aria-label={`Drag to reorder ${label}`}
      title="Drag to reorder (or focus and use Space + arrow keys)"
      className={`flex shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md px-1.5 text-lg leading-none text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-neutral-900 active:cursor-grabbing ${className}`}
    >
      ⠿
    </button>
  );
}

/** Makes a larger area (e.g. a photo) the drag handle. Also focusable for keyboard reordering. */
export function DragArea({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  const ctx = use(SortableItemContext);
  const activator = use(ActivatorContext);
  if (!ctx) return <div className={className}>{children}</div>;
  return (
    <div
      ref={activator}
      {...ctx.attributes}
      {...ctx.listeners}
      aria-label={label}
      className={`cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 active:cursor-grabbing ${className}`}
    >
      {children}
    </div>
  );
}

/** Moves the item at `index` to the top / bottom of the list. */
export const toTop = <T,>(list: T[], index: number) => arrayMove(list, index, 0);
export const toBottom = <T,>(list: T[], index: number) => arrayMove(list, index, list.length - 1);
