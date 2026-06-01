# MiniSynth32

MiniSynth32 é um sintetizador digital baseado em ESP32-S3 com interface web para controle em tempo real, gerenciamento de presets e visualização de parâmetros. O projeto combina firmware embarcado, back-end Node.js e front-end React para formar uma arquitetura integrada voltada à síntese sonora, operação em Linux e persistência local com SQLite [file:3][file:4].

## Sumário

- [Visão geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Front-end](#front-end)
- [Back-end](#back-end)
- [Banco de dados](#banco-de-dados)
- [Áudio e saída analógica](#áudio-e-saída-analógica)
- [Hardware principal](#hardware-principal)
- [Estrutura sugerida do repositório](#estrutura-sugerida-do-repositório)
- [Fluxo de execução](#fluxo-de-execução)
- [Como rodar](#como-rodar)
- [Protocolo de comunicação](#protocolo-de-comunicação)
- [Status do projeto](#status-do-projeto)

## Visão geral

O sistema foi concebido para executar síntese no ESP32-S3, transmitir estados e parâmetros ao servidor por conexão serial USB e expor esse estado ao front-end por WebSocket em tempo real [file:3]. Além disso, o servidor deve disponibilizar API REST para presets, persistir dados em SQLite e servir os arquivos estáticos do front-end React em ambiente Linux [file:3][file:4].

A interface mostrada no projeto organiza os controles em torno de parâmetros típicos de um sintetizador subtrativo, com seções dedicadas a seleção de forma de onda, afinação, nível, envelope ADSR, filtro, arpeggiator, monitor de onda, teclado virtual e diretório de presets [image:1]. Esse desenho é coerente com os requisitos funcionais já definidos para exibição e alteração de parâmetros do sintetizador em tempo real [file:3].

## Arquitetura

A arquitetura é composta por três camadas principais [file:4]:

1. **Firmware no ESP32-S3**: responsável pela geração de áudio, leitura de controles locais, processamento de notas e atualização de parâmetros do motor de síntese [file:3].
2. **Back-end Node.js**: responsável por receber mensagens do ESP32 via serial, repassar estados para o front-end por WebSocket, expor endpoints REST para presets e servir a aplicação web em produção [file:3].
3. **Front-end React**: responsável pela interface de operação, visualização do estado do sintetizador, edição de parâmetros e gerenciamento de presets [file:3][file:4].

Fluxo resumido:

```text
ESP32-S3 <-> Serial USB <-> Node.js/Express <-> WebSocket/REST <-> React
                                |
                                +-> SQLite
                                |
                                +-> Static hosting do front-end
```

## Stack

| Camada | Tecnologia | Papel |
|---|---|---|
| Firmware | ESP32-S3 | Geração de áudio e controle embarcado [file:3] |
| Conversão de áudio | PCM5102A | Conversão digital-analógica estéreo via interface PCM/I2S [file:3][cite:1] |
| Back-end | Node.js + Express | API REST, serial, WebSocket e hosting do front [file:3][file:4] |
| Tempo real | WebSocket | Sincronização de parâmetros e estado com a interface [file:3] |
| Banco de dados | SQLite | Persistência local de presets e histórico de sessão [file:3] |
| Front-end | React | Interface do sintetizador e operação do usuário [file:3][file:4] |
| Build tooling | Vite | Empacotamento e desenvolvimento do front-end, conforme a estrutura atual do projeto [image:1] |
| Sistema-alvo | Linux | Ambiente previsto para execução do servidor [file:3] |

## Front-end

O front-end é uma aplicação React orientada a controle em tempo real, com componentes equivalentes a knobs, toggles, seletores e teclado virtual, organizados em painéis funcionais [file:3][image:1]. Pela interface disponível, os grupos visuais principais incluem seleção de waveform, controle de tune e level, arpeggiator, envelope ADSR, filtro, monitor de onda, teclado virtual e gerenciamento de presets [image:1].

Nos requisitos funcionais, a interface deve exibir parâmetros de OSC1, filtro, ADSR e arpeggiator, além de enviar alterações ao ESP32 por intermédio do back-end via WebSocket [file:3]. Também deve permitir salvar e carregar presets via API REST, reforçando a separação entre camada de apresentação e camada de persistência [file:3].

## Back-end

O back-end é a camada de integração do sistema. Ele deve receber dados do ESP32 por porta serial USB e repassá-los ao front-end por WebSocket, além de aceitar comandos vindos da interface e encaminhá-los de volta ao dispositivo embarcado [file:3].

Além da comunicação em tempo real, o servidor precisa oferecer CRUD completo de presets via API REST com Express, persistência em SQLite, logs de falha para serial e API, e capacidade de servir os arquivos estáticos do front-end React em produção [file:3]. O deploy-alvo é Linux, sem dependência de banco externo ou componentes proprietários [file:3].

Responsabilidades esperadas do back-end:

- gerenciamento da porta serial do ESP32 [file:3]
- sincronização de estado via WebSocket [file:3]
- persistência de presets em SQLite [file:3]
- exposição de API REST para consulta e atualização de presets [file:3]
- hosting do build do front-end [file:3]
- registro de erros operacionais [file:3]

## Banco de dados

O banco de dados previsto é SQLite, adotado como armazenamento leve e local, sem servidor dedicado [file:3]. Esse banco deve ser usado para salvar presets e histórico de sessão, atendendo aos requisitos de persistência do projeto [file:3].

Uma modelagem mínima recomendada inclui:

- `presets`: identificação, nome, descrição, data de criação e atualização
- `preset_params`: snapshot dos parâmetros associados ao preset
- `session_history`: eventos relevantes de operação ou restauração de estado

Como o escopo atualizado removeu o MIDI mapping, essa parte não deve aparecer como módulo funcional do sistema, mesmo que estivesse prevista em versões anteriores dos requisitos [file:3].

## Áudio e saída analógica

A geração de áudio é responsabilidade do ESP32-S3, enquanto a conversão do sinal digital para áudio analógico estéreo é feita pelo PCM5102A [file:3]. O requisito do projeto define saída estéreo por conector P2 de 3,5 mm, usando esse DAC como etapa de conversão antes da conexão com fones, caixas amplificadas ou entrada de monitoramento [file:3].

O PCM5102A é um DAC estéreo com interface PCM compatível com formatos como I2S e dados de 16, 24 e 32 bits, com taxa de amostragem de 8 kHz até 384 kHz e SNR típico de 112 dB [cite:1]. O componente possui driver de linha integrado, saída em nível de linha de aproximadamente 2,1 VRMS, dispensa capacitores de bloqueio DC na saída e pode operar com conexão I2S de três fios graças ao PLL interno, que elimina a exigência de clock mestre dedicado em muitos cenários [cite:1].

Na prática, o fluxo de áudio funciona assim:

1. O motor de síntese no ESP32 gera amostras digitais de áudio [file:3].
2. Essas amostras são transmitidas ao PCM5102A por interface PCM/I2S [file:3][cite:1].
3. O PCM5102A converte os dados digitais em sinal analógico estéreo de nível de linha [cite:1].
4. O sinal convertido é encaminhado ao conector P2 de 3,5 mm para monitoração externa [file:3].

O requisito não funcional do firmware também prevê operação do DAC em 44,1 kHz ou 48 kHz. [file:3][cite:1].

## Hardware principal

O conjunto principal descrito para o projeto inclui os seguintes componentes [file:4]:

- ESP32-S3 como microcontrolador principal [file:4]
- PCM5102A como DAC estéreo [file:3][cite:1]
- Display OLED SSD1306 de 0,96 polegadas para exibição local de parâmetros [file:3][file:4]
- Potenciômetros de 10K para controle em tempo real [file:3][file:4]
- Entrada USB para comunicação com controlador MIDI e/ou conexão serial com PC [file:4]

## Estrutura do repositório

```text
minisynth32/
├─ frontend/
│  ├─ public/
│  ├─ src/
│  ├─ package.json
│  └─ vite.config.ts
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ db/
│  │  ├─ middleware/
│  │  ├─ types/
│  │  ├─ app.ts
│  │  └─ server.ts
│  └─ package.json
├─ firmware/
│  └─ esp32/
├─ docs/
└─ README.md
```

## Fluxo de execução

1. O ESP32-S3 inicializa o motor de áudio e a interface com o PCM5102A [file:3].
2. O firmware passa a receber eventos locais e atualizar o estado interno do sintetizador [file:3].
3. O back-end abre a porta serial USB e sincroniza os parâmetros recebidos do ESP32 [file:3].
4. O front-end conecta-se ao servidor por WebSocket para refletir o estado em tempo real [file:3].
5. Alterações feitas na interface são enviadas ao servidor e repassadas ao ESP32 [file:3].
6. Presets podem ser persistidos e recuperados via API REST e SQLite [file:3].

## Como rodar

### Pré-requisitos

- Node.js instalado no ambiente de desenvolvimento
- npm instalado
- ambiente Linux para deploy do servidor, conforme requisito do projeto [file:3]
- ESP32-S3 programado com o firmware do sintetizador [file:3][file:4]
- módulo PCM5102A ligado ao ESP32 e à saída de áudio do equipamento [file:3][cite:1]
- cabo USB para comunicação serial entre ESP32 e computador/host [file:3][file:4]

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd minisynth32
```

### 2. Instalar dependências do front-end

```bash
cd frontend
npm install
npm run dev
```


### 3. Instalar dependências do back-end

```bash
cd ../backend
npm install
npm run dev
```

O back-end deve iniciar o servidor HTTP, a camada REST, o WebSocket e a rotina de comunicação serial com o ESP32 [file:3].

### 4. Programar e conectar o ESP32

Compile e grave o firmware no ESP32-S3. Em seguida:

- conecte o ESP32 ao computador por USB
- confirme a porta serial disponível no sistema
- configure o back-end para abrir essa porta
- ligue o módulo PCM5102A às linhas de áudio digital do ESP32 e à saída P2 do circuito [file:3][cite:1]

### 5. Executar em produção

Fluxo recomendado:

```bash
cd frontend
npm run build

cd ../backend
npm install
npm run start
```

## Protocolo de comunicação

O protocolo entre back-end e ESP32 pode ser mantido simples, baseado em mensagens JSON por linha sobre serial USB. Isso é coerente com a necessidade de sincronizar parâmetros de forma bidirecional sem acoplar o servidor ao código interno do firmware [file:3].

Exemplos:

```json
{"type":"param_set","path":"osc1.level","value":72}
{"type":"state_update","path":"filter.cutoff","value":11600}
{"type":"preset_load","name":"Patch Inicial"}
{"type":"ack","path":"filter.cutoff","ok":true}
```

No lado do front-end, a atualização de estado deve ocorrer via WebSocket, enquanto operações de persistência, como salvar ou listar presets, podem ocorrer via REST [file:3].

## Status do projeto

O escopo já documentado estabelece base funcional para front-end React, back-end Node.js/Express, comunicação serial com ESP32-S3, persistência em SQLite e saída de áudio estéreo com PCM5102A [file:3][file:4][cite:1]. A interface atual também demonstra aderência visual e funcional ao objetivo do projeto, com foco em manipulação direta de parâmetros e gerenciamento de presets [image:1].
