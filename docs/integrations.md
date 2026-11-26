# Integrações / Integrations

## Estado atual / Current state

O Ops Autopsy pode ser instalado localmente no Visual Studio Code através de um pacote VSIX. A extensão abre a interface existente numa Webview e inclui apenas o adaptador `demo`, que fornece cenários fictícios locais. A versão autónoma para browser continua disponível. Não há conectores a serviços de incidentes nem pedidos a APIs de fornecedores.

Ops Autopsy can be installed locally in Visual Studio Code from a VSIX package. The extension opens the existing interface in a Webview and includes only the `demo` adapter, which provides fictional local scenarios. The standalone browser version remains available. There are no incident-service connectors or provider API requests.

## Configuração do utilizador / User configuration

Na extensão, o diálogo de definições guarda `providerId`, `workspaceName` e `environmentName` na preferência global `opsAutopsy.preferences` do perfil de utilizador do VS Code. A versão autónoma guarda estes valores não sensíveis no `localStorage` do browser. Nenhuma das versões aceita ou persiste credenciais.

In the extension, the settings dialog saves `providerId`, `workspaceName`, and `environmentName` in the global `opsAutopsy.preferences` setting in the VS Code user profile. The standalone browser version stores these non-secret values in browser `localStorage`. Neither version accepts or persists credentials.

The only available `providerId` is `demo`. Selecting it does not connect to a real source or filter operational data. Real connectors must be implemented and added to the registry before users can select them.

## Contrato de adaptador / Adapter contract

Cada adaptador registado deve ter:

- Um `id` único em minúsculas, um nome, um nome curto e uma descrição.
- Uma função assíncrona `loadIncidents(settings)` que devolve incidentes no formato usado por `app.js`.
- Um comportamento exclusivamente de leitura. Não pode executar, repetir, cancelar ou alterar execuções nem recursos.
- Erros explícitos quando a ligação ou a leitura falhar; nunca deve apresentar dados fictícios como sucesso de uma fonte real.

Each registered adapter must provide:

- A unique lowercase `id`, a label, a short label, and a description.
- An asynchronous `loadIncidents(settings)` function returning incidents in the format used by `app.js`.
- Read-only behaviour. It must not execute, retry, cancel, or modify runs or resources.
- Explicit errors when connection or reading fails; it must never present fictional data as a successful response from a real source.

## Fronteiras de segurança / Security boundaries

A Webview da extensão limita scripts aos recursos locais com CSP e bloqueia pedidos de ligação através de `connect-src 'none'`. O CSS pode carregar Outfit e DM Mono de Google Fonts; se essa ligação não estiver disponível, são usadas fontes alternativas. Não são enviadas evidências, configurações ou credenciais para esse serviço de fontes.

The extension Webview restricts scripts to packaged resources with CSP and blocks connection requests using `connect-src 'none'`. Its stylesheet may load Outfit and DM Mono from Google Fonts; CSS fallback fonts are used when that service is unavailable. No evidence, settings, or credentials are sent to the font service.

As definições atuais não têm campos de credenciais. Não adicione tokens ao `localStorage` ou às definições do VS Code. Um conector real deve usar o `SecretStorage` da extensão e pedir apenas as permissões de leitura necessárias. O manifesto, os adaptadores reais e os respetivos testes de compatibilidade continuam por implementar.

The current settings have no credential fields. Do not add tokens to `localStorage` or VS Code settings. A real connector must use the extension's `SecretStorage` and request only the read permissions it needs. Real adapters, their manifests, and compatibility tests remain unimplemented.
