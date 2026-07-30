# 🚀 Guía de Despliegue de autopulse-web (Next.js 16) en Google Cloud Run

Esta guía especifica los pasos necesarios para desplegar la aplicación web **autopulse-web** en Google Cloud Run usando GitHub Actions.

---

## 🔑 Secretos de GitHub Requeridos

En el repositorio **autopulse-web** (`GitHub -> Settings -> Secrets and variables -> Actions`), registra los siguientes secretos:

| Secreto | Descripción | Requerido |
| :--- | :--- | :--- |
| `GCP_PROJECT_ID` | ID de tu proyecto en Google Cloud (ej. `autopulse-prod-12345`) | **Sí** |
| `GCP_SA_KEY` | *(Opción SA Key)* Contenido raw JSON de la Service Account key | Sí (salvo WIF) |
| `GCP_WIF_PROVIDER` | *(Opción WIF)* Identificador del Workload Identity Provider | Sí (salvo SA Key) |
| `GCP_WIF_SA_EMAIL` | *(Opción WIF)* Email de la Service Account (`github-actions-deployer@...`) | Sí (salvo SA Key) |
| `NEXT_PUBLIC_API_URL` | URL base de la API de producción (`https://autopulse-api-xyz-uc.a.run.app`) | **Sí** |

---

## 🛠️ Comandos de Configuración de GCP (Resumen)

Para crear el repositorio de Artifact Registry y asignar los permisos adecuados a la Service Account:

```bash
# Habilitar servicios
gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project="TU_GCP_PROJECT_ID"

# Crear repositorio Docker en us-central1
gcloud artifacts repositories create autopulse-repository \
    --repository-format=docker \
    --location=us-central1 \
    --description="Repositorio de imágenes Docker para AutoPulse"
```

Para una guía detallada con Workload Identity Federation (WIF) paso a paso, consulta la [Guía Principal de Despliegue](file:///d:/projects/AutoPulse/docs/deploy-cloudrun-guide.md).
