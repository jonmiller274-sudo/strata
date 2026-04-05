"use client";

import type { HubMockupSection, HubNode } from "@/types/artifact";
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
  const layers = section.content.layers;

  // Layered mode: show layer editor
  if (layers && layers.length > 0) {
    return (
      <div className="space-y-5">
        <LayersEditor
          layers={layers}
          onFieldChange={onFieldChange}
        />

        {/* Description */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
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

  // Legacy flat mode: center + nodes + connections
  const nodes = section.content.nodes;
  const connections = section.content.connections || [];
  const allNodes = [section.content.center, ...nodes];

  return (
    <div className="space-y-5">
      {/* Center node */}
      <div>
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
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
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
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
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
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
              <span className="text-xs text-muted-foreground">&rarr;</span>
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
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
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

/** Layers editor — edit layer labels and nodes within each layer */
function LayersEditor({
  layers,
  onFieldChange,
}: {
  layers: HubMockupSection["content"]["layers"];
  onFieldChange: (path: string, value: unknown) => void;
}) {
  if (!layers) return null;

  return (
    <ItemManager
      items={layers}
      getItemId={(layer, i) => `layer-${layer.label}-${i}`}
      onAdd={() => {
        const newLayer = {
          label: "New Layer",
          nodes: [
            {
              id: crypto.randomUUID(),
              label: "New Node",
              description: "Click to edit",
            },
          ],
        };
        onFieldChange("content.layers", [...layers, newLayer]);
      }}
      onRemove={(index) => {
        onFieldChange(
          "content.layers",
          layers.filter((_, i) => i !== index)
        );
      }}
      onReorder={(from, to) => {
        const updated = [...layers];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        onFieldChange("content.layers", updated);
      }}
      addLabel="Add layer"
      minItems={1}
      renderItem={(layer, layerIndex) => (
        <div className="space-y-2">
          {/* Layer label */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              L{layerIndex + 1}
            </span>
            <div className="flex-1">
              <InlineEditor
                value={layer.label}
                onChange={(v) =>
                  onFieldChange(`content.layers.${layerIndex}.label`, v)
                }
                className="text-[10px] font-medium uppercase tracking-wide text-accent"
              />
            </div>
          </div>

          {/* Nodes in this layer */}
          <ItemManager
            items={layer.nodes}
            getItemId={(node) => node.id}
            onAdd={() => {
              const newNode: HubNode = {
                id: crypto.randomUUID(),
                label: "New Node",
                description: "Click to edit",
              };
              onFieldChange(`content.layers.${layerIndex}.nodes`, [
                ...layer.nodes,
                newNode,
              ]);
            }}
            onRemove={(index) => {
              onFieldChange(
                `content.layers.${layerIndex}.nodes`,
                layer.nodes.filter((_, i) => i !== index)
              );
            }}
            onReorder={(from, to) => {
              const updated = [...layer.nodes];
              const [moved] = updated.splice(from, 1);
              updated.splice(to, 0, moved);
              onFieldChange(`content.layers.${layerIndex}.nodes`, updated);
            }}
            addLabel="Add node"
            minItems={1}
            renderItem={(node, i) => (
              <NodeEditor
                prefix={`content.layers.${layerIndex}.nodes.${i}`}
                node={node}
                onFieldChange={onFieldChange}
              />
            )}
          />

          {/* Arrow label — only for layers that have a next layer below them */}
          {layerIndex < layers!.length - 1 && (
            <div>
              <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide mb-1 block">
                Arrow label
              </label>
              <InlineEditor
                value={layer.transition || ""}
                onChange={(v) =>
                  onFieldChange(`content.layers.${layerIndex}.transition`, v || undefined)
                }
                placeholder="e.g. 350K cameras generate the distribution"
                className="text-xs italic text-muted-foreground"
              />
            </div>
          )}
        </div>
      )}
    />
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
