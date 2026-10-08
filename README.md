# WooCommerce Hosting Platform with Team MCP Gateway

An advanced, Kubernetes-native platform for hosting WooCommerce stores, orchestrated alongside a multi-tenant Model Context Protocol (Gateway). This repository follows the strict 2026-07-28 Streamable HTTP specification.

## Architecture & Threat Model

The platform is designed around strict network security boundaries and deep defense perimeters to ensure enterprise-grade safety for both the e-commerce engine and the LLM inference loop.

- **E-Commerce State & Interfacing**: MariaDB and WordPress run completely isolated at the network level. External ingress is tightly governed via default-deny baseline policies. Only the ingress-controller and the custom MCP Server can interface with WordPress.
- **MCP Gateway (Control Plane)**: The Gateway manages API key authorization and securely holds upstream bearer tokens encrypted at rest. It acts as the *only* entry point for downstream clients and Chat Agents. By enforcing this choke point, unauthenticated or generic LLM payloads can never bypass authentication or directly manipulate the store. The Gateway aggregates tools and resolves namespace collisions dynamically.
- **WooCommerce MCP Server**: Follows the Streamable HTTP protocol utilizing a single, stateless HTTP POST endpoint (`/mcp`) while safely isolating JSON-RPC errors (ToolErrors vs protocol MCPErrors). It enforces strict `Origin` header validations to prevent any localized DNS-rebinding attacks.

## Deployment Playbooks

### Local Deployment (kind, minikube, or k3d)

1. Provision an ephemeral cluster (e.g. `kind create cluster`).
2. Install the necessary Nginx Ingress Controller bindings for your local environment.
3. Deploy the core stack using the local values overlay:
   ```bash
   helm upgrade --install mcp-platform ./helm \
     -f ./helm/values-local.yaml \
     --namespace mcp-tenant --create-namespace
   ```

### Production Deployment (VPS via k3s)

Production topologies assume a running `k3s` environment leveraging the `local-path` volume provisioner and an integrated `traefik` Ingress router alongside `cert-manager`.

1. Ensure `cert-manager` is properly installed on the cluster to dynamically respond to the `cert-manager.io/cluster-issuer` annotations within `ingress.yaml`.
2. Apply the production definitions to inject domain bindings and automated TLS configurations:
   ```bash
   helm upgrade --install mcp-platform ./helm \
     -f ./helm/values-prod.yaml \
     --namespace mcp-tenant --create-namespace
   ```
