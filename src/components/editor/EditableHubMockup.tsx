"use client";

import type { HubMockupSection } from "@/types/artifact";
import { InlineEditor } from "./InlineEditor";
import { ItemManager } from "./ItemManager";

interface EditableHubMockupProps {
  section: HubMockupSection;
  onFieldChange: (path: string, value: unknown) => void;
}

export function EditableHubMockup({
  section,
  onFieldChange,
}: EditableHubMockupProps) {
  const nodes = section.content.nodes;
  const connections = section.content.connections || [];
  const allNodes = [section.content.center, ...nodes];

  return (
    <div className="space-y-5">
      {/* Center node */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          Center Node
        </label>
        <NodeEditor
          prefix="content.center"
          node={section.content.center}
          onFieldChange={onFieldChange}
        />
      </div>

      {/* Surrounding nodes */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          Surrounding Nodes
        </label>
        <ItemManager
          items={nodes}
          getItemId={(node) => node.id}
          onAdd={() => {
            const newNode = {
              id: crypto.randomUUID(),
              label: "New Node",
              description: "Click to edit",
              color: "#6366f1",
            };
            onFieldChange("content.nodes", [...nodes, newNode]);
          }}
          onRemove={(index) => {
            const removedId = nodes[index].id;
            // Also remove connections referencing this node
            const updatedConnections = connections.filter(
              (c) => c.from !== removedId && c.to !== removedId
            );
            onFieldChange(
              "content.nodes",
              nodes.filter((_, i) => i !== index)
            );
            onFieldChange("content.connections", updatedConnections);
          }}
          onReorder={(from, to) => {
            const updated = [...nodes];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            onFieldChange("content.nodes", updated);
          }}
          addLabel="Add node"
          minItems={1}
          renderItem={(node, i) => (
            <NodeEditor
              prefix={`content.nodes.${i}`}
              node={node}
              onFieldChange={onFieldChange}
            />
          )}
        />
      </div>

      {/* Connections */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          Connections
        </label>
        <ItemManager
          items={connections}
          getItemId={(conn, i) => `conn-${conn.from}-${conn.to}-${i}`}
          onAdd={() => {
            const newConn = {
              from: section.content.center.id,
              to: nodes[0]?.id || section.content.center.id,
              label: "",
            };
            onFieldChange("content.connections", [
              ...connections,
              newConn,
            ]);
          }}
          onRemove={(index) => {
            onFieldChange(
              "content.connections",
              connections.filter((_, i) => i !== index)
            );
          }}
          onReorder={(from, to) => {
            const updated = [...connections];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            onFieldChange("content.connections", updated);
          }}
          addLabel="Add connection"
          renderItem={(conn, i) => (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <select
                value={conn.from}
                onChange={(e) =>
                  onFieldChange(
                    `content.connections.${i}.from`,
                    e.target.value
                  )
                }
                className="bg-white/10 rounded px-1.5 py-0.5 text-sm outline-none ring-1 ring-white/10 focus:ring-accent/50"
              >
                {allNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">→</span>
              <select
                value={conn.to}
                onChange={(e) =>
                  onFieldChange(
                    `content.connections.${i}.to`,
                    e.target.value
                  )
                }
                className="bg-white/10 rounded px-1.5 py-0.5 text-sm outline-none ring-1 ring-white/10 focus:ring-accent/50"
              >
                {allNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
              <div className="flex-1">
                <InlineEditor
                  value={conn.label || ""}
                  onChange={(v) =>
                    onFieldChange(`content.connections.${i}.label`, v)
                  }
                  placeholder="Connection label"
                  className="text-xs"
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
          Description
        </label>
        <InlineEditor
          value={section.content.description || ""}
          onChange={(v) => onFieldChange("content.description", v)}
          multiline
          placeholder="Add description..."
        />
      </div>
    </div>
  );
}

function NodeEditor({
  prefix,
  node,
  onFieldChange,
}: {
  prefix: string;
  node: { id: string; label: string; description?: string; color?: string };
  onFieldChange: (path: string, value: unknown) => void;
}) {
  return (
    <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
      <input
        type="color"
        value={node.color || "#6366f1"}
        onChange={(e) => onFieldChange(`${prefix}.color`, e.target.value)}
        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent mt-0.5"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <InlineEditor
          value={node.label}
          onChange={(v) => onFieldChange(`${prefix}.label`, v)}
        />
        <InlineEditor
          value={node.description || ""}
          onChange={(v) => onFieldChange(`${prefix}.description`, v)}
          multiline
          placeholder="Add description..."
          className="text-sm text-foreground/70"
        />
      </div>
    </div>
  );
}
