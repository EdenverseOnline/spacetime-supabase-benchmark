from diagrams import Diagram, Cluster, Edge
from diagrams.programming.language import Rust, TypeScript
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.storage import Storage
from diagrams.programming.framework import React
from diagrams.generic.network import Firewall
from diagrams.custom import Custom
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "docs", "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

spacetimedb_icon = os.path.join(ASSETS_DIR, "spacetimedb.png")
supabase_icon = os.path.join(ASSETS_DIR, "supabase.png")
websocket_icon = os.path.join(ASSETS_DIR, "websocket.png")

graph_attr = {
    "fontsize": "20",
    "bgcolor": "#0d1117",
    "fontcolor": "#e6edf3",
    "pad": "0.5",
}
node_attr = {
    "fontsize": "12",
    "fontcolor": "#e6edf3",
}
edge_attr = {
    "color": "#58a6ff",
    "fontcolor": "#8b949e",
    "fontsize": "10",
}

with Diagram(
    "Supabase Architecture: Traditional REST Round-Trip",
    filename=os.path.join(ASSETS_DIR, "supabase_architecture"),
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
):
    with Cluster("Player Browser", graph_attr={"bgcolor": "#161b22", "fontcolor": "#e6edf3"}):
        client = React("React Client")

    with Cluster("Supabase Cloud", graph_attr={"bgcolor": "#1a1e24", "fontcolor": "#e6edf3"}):
        api = Custom("REST API\nGateway", supabase_icon)
        db = PostgreSQL("PostgreSQL\n(Disk-backed)")

    client >> Edge(label="1. HTTP POST\n(JSON payload)", color="#f59e0b") >> api
    api >> Edge(label="2. SQL UPSERT", color="#f59e0b") >> db
    db >> Edge(label="3. Result Row", color="#f59e0b", style="dashed") >> api
    api >> Edge(label="4. JSON Response", color="#f59e0b", style="dashed") >> client

with Diagram(
    "SpacetimeDB Architecture: WebSocket + WASM Round-Trip",
    filename=os.path.join(ASSETS_DIR, "spacetimedb_architecture"),
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
):
    with Cluster("Player Browser", graph_attr={"bgcolor": "#161b22", "fontcolor": "#e6edf3"}):
        client2 = React("React Client")
        cache = Storage("Local Synced\nCache (Memory)")

    with Cluster("SpacetimeDB Server", graph_attr={"bgcolor": "#0f2a1e", "fontcolor": "#e6edf3"}):
        wasm = Custom("WASM Reducer\n(In-Memory)", spacetimedb_icon)
        tables = Storage("In-Memory\nTables")

    ws = Custom("Persistent\nWebSocket", websocket_icon)

    client2 >> Edge(label="1. Binary Msg", color="#10b981") >> ws
    ws >> Edge(label="2. Invoke", color="#10b981") >> wasm
    wasm >> Edge(label="3. Memory Write", color="#10b981") >> tables
    tables >> Edge(label="4. Subscription\nPush", color="#10b981", style="dashed") >> ws
    ws >> Edge(label="5. Row Update", color="#10b981", style="dashed") >> cache
    cache >> Edge(label="Local Read", color="#06b6d4", style="dotted") >> client2

if __name__ == "__main__":
    print("Architecture diagrams generated in docs/assets/")
