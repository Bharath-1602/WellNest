{{/* Resolve namespace from global values */}}
{{- define "wellnest.namespace" -}}
{{- .Values.global.namespace }}
{{- end }}

{{/* Resolve environment from global values */}}
{{- define "wellnest.environment" -}}
{{- .Values.global.environment }}
{{- end }}

{{/* Common labels for every resource */}}
{{- define "wellnest.labels" -}}
app.kubernetes.io/part-of: wellnest
app.kubernetes.io/managed-by: Helm
environment: {{ .Values.global.environment }}
{{- end }}

{{/* Internal DNS URL for auth-service */}}
{{- define "wellnest.authURL" -}}
http://{{ .Values.global.services.auth.host }}.{{ .Values.global.namespace }}.svc.cluster.local:{{ .Values.global.services.auth.port }}
{{- end }}

{{/* Internal DNS URL for assessment-service */}}
{{- define "wellnest.assessmentURL" -}}
http://{{ .Values.global.services.assessment.host }}.{{ .Values.global.namespace }}.svc.cluster.local:{{ .Values.global.services.assessment.port }}
{{- end }}

{{/* Internal DNS URL for therapist-service */}}
{{- define "wellnest.therapistURL" -}}
http://{{ .Values.global.services.therapist.host }}.{{ .Values.global.namespace }}.svc.cluster.local:{{ .Values.global.services.therapist.port }}
{{- end }}

{{/* Full Docker image reference: include "wellnest.image" (dict "repo" .Values.auth.image.repository "tag" .Values.auth.image.tag "root" .) */}}
{{- define "wellnest.image" -}}
docker.io/{{ .root.Values.global.dockerUsername }}/{{ .repo }}:{{ .tag }}
{{- end }}
