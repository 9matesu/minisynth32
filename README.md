# MiniSynth32

MiniSynth32 é um sintetizador digital baseado em ESP32-S3 com interface web para controle em tempo real, gerenciamento de presets e visualização de parâmetros. O projeto combina firmware embarcado, back-end Node.js e front-end React para formar uma arquitetura integrada voltada à síntese sonora, operação em Linux e persistência local com SQLite. Parte do projeto de curricularização do curso de Análise e Desenvolvimento de Sistemas da FATEC Cruzeiro, foi desenvolvido para o programa Acelera 01/2026.

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

## Visão geral

O sistema foi concebido para executar síntese no ESP32-S3, transmitir estados e parâmetros ao servidor por conexão serial USB e expor esse estado ao front-end por WebSocket em tempo real. Além disso, o servidor deve disponibilizar API REST para presets, persistir dados em SQLite e servir os arquivos estáticos do front-end React em ambiente Linux. O desenvolvimento ocorreu com auxílio de ferramentas de IA, tal como Gemini, Codex e Claude Code.

A interface do projeto organiza os controles em torno de parâmetros típicos de um sintetizador subtrativo. Ela também traz um módulo de **Tutorial Integrado** com aulas interativas sobre Síntese Sonora, um sistema de Conquistas/XP salvo diretamente no banco de dados e funções dinâmicas (ex: reproduzir melodias MIDI famosas de presets no próprio app).

## Arquitetura

A arquitetura é composta por três camadas principais:

1. **Firmware no ESP32-S3**: responsável pela geração de áudio, leitura de controles locais, processamento de notas e atualização de parâmetros do motor de síntese.
2. **Back-end Node.js**: responsável por receber mensagens do ESP32 via serial, repassar estados para o front-end por WebSocket, expor endpoints REST para presets e servir a aplicação web em produção.
3. **Front-end React**: responsável pela interface de operação, visualização do estado do sintetizador, edição de parâmetros e gerenciamento de presets.

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
| Firmware | ESP32-S3 | Geração de áudio e controle embarcado |
| Conversão de áudio | PCM5102A | Conversão digital-analógica estéreo via interface PCM/I2S |
| Back-end | Node.js + Express | API REST, serial, WebSocket e hosting do front |
| Tempo real | WebSocket | Sincronização de parâmetros e estado com a interface |
| Banco de dados | SQLite | Persistência local de presets e histórico de sessão |
| Front-end | React | Interface do sintetizador e operação do usuário |
| Build tooling | Vite | Empacotamento e desenvolvimento do front-end, conforme a estrutura atual do projeto |
| Sistema-alvo | Linux | Ambiente previsto para execução do servidor |

## Front-end

O front-end é uma aplicação React orientada a controle em tempo real, com componentes equivalentes a knobs, toggles, seletores e teclado virtual, organizados em painéis funcionais. Pela interface disponível, os grupos visuais principais incluem seleção de waveform, controle de tune e level, arpeggiator, envelope ADSR, filtro, monitor de onda em tempo real (OLED simulado), teclado virtual e gerenciamento de presets.

Nos requisitos funcionais, a interface deve exibir parâmetros do sintetizador e sincronizá-los bidirecionalmente, providenciar **ajuda interativa em tempo real** ao passar o mouse sobre botões/knobs, e suportar um sistema robusto de aprendizado (com lições que travam/destravam painéis até o usuário dominar os controles corretos, premiando XP no final).

## Back-end

O back-end é a camada de integração do sistema. Ele deve receber dados do ESP32 por porta serial USB e repassá-los ao front-end por WebSocket, além de aceitar comandos vindos da interface e encaminhá-los de volta ao dispositivo embarcado.

Além da comunicação em tempo real, o servidor precisa oferecer CRUD completo de presets via API REST com Express, persistência em SQLite, logs de falha para serial e API, e capacidade de servir os arquivos estáticos do front-end React em produção. O deploy-alvo é Linux, sem dependência de banco externo ou componentes proprietários.

Responsabilidades esperadas do back-end:

- gerenciamento bidirecional da porta serial do ESP32
- sincronização de estado via WebSocket
- persistência de presets, mapeamentos MIDI, Perfil de Usuário, XP e progresso do tutorial em SQLite
- exposição de API REST
- hosting do build do front-end

## Banco de dados

O banco de dados utilizado foi o SQLite, adotado como armazenamento leve e local, sem servidor dedicado. Esse banco foi usado para salvar presets e histórico de sessão.

## Áudio e saída analógica

A geração de áudio é responsabilidade do ESP32-S3, enquanto a conversão do sinal digital para áudio analógico estéreo é feita pelo PCM5102A. O requisito do projeto define saída estéreo por conector P2 de 3,5 mm, usando esse DAC como etapa de conversão antes da conexão com fones, caixas amplificadas ou entrada de monitoramento.

O PCM5102A é um DAC estéreo com interface PCM compatível com formatos como I2S e dados de 16, 24 e 32 bits, com taxa de amostragem de 8 kHz até 384 kHz e SNR típico de 112 dB. 

Na prática, o fluxo de áudio segue:

1. O motor de síntese no ESP32 gera amostras digitais de áudio.
2. Essas amostras são transmitidas ao PCM5102A por interface PCM/I2S.
3. O PCM5102A converte os dados digitais em sinal analógico mono.
4. O sinal convertido é encaminhado ao conector P2 de 3,5 mm para monitoração externa.

## Hardware principal

O conjunto principal descrito para o projeto inclui os seguintes componentes:

- ESP32-S3
- PCM5102A 
- Display OLED SSD1306 de 0,96 polegadas (Interface mista OLED/App)
- Potenciômetros de 10K
- Botões Push (Acorde Maior, Acorde Menor, Wave, Arpeggiator)
  - *Dica:* Segurar os botões de acorde atua como "modificador". Ao enviar uma nota pelo frontend com o botão pressionado na protoboard, um acorde completo polifônico será tocado/arpejado!
- Entrada USB para comunicação com controlador MIDI e/ou conexão serial com PC

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

1. O ESP32-S3 inicializa o motor de áudio e a interface com o PCM5102A
2. O firmware passa a receber eventos locais e atualizar o estado interno do sintetizador
3. O back-end abre a porta serial USB e sincroniza os parâmetros recebidos do ESP32
4. O front-end conecta-se ao servidor por WebSocket para refletir o estado em tempo real
5. Alterações feitas na interface são enviadas ao servidor e repassadas ao ESP32 
6. Presets podem ser persistidos e recuperados via API REST e SQLite

## Como rodar

### Pré-requisitos

- Node.js instalado no ambiente de desenvolvimento
- npm instalado
- ambiente Linux para deploy do servidor, conforme requisito do projeto
- ESP32-S3 programado com o firmware do sintetizador
- módulo PCM5102A ligado ao ESP32 e à saída de áudio do equipamento
- cabo USB para comunicação serial entre ESP32 e computador/host

### 1. Execute o Assistente de Configuração Automática

Caso utilize Linux Mint ou derivados do Ubuntu/Debian, criamos um assistente automatizado que vai garantir que o compilador do Arduino, bibliotecas do DSP, NodeJS e SQLite3 estejam corretos:

```bash
chmod +x setup-wizard-linux.sh
./setup-wizard-linux.sh
```

### 2. Clonar o repositório

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

O back-end deve iniciar o servidor HTTP, a camada REST, o WebSocket e a rotina de comunicação serial com o ESP32.

### 4. Programar e conectar o ESP32

Compile e grave o firmware no ESP32-S3. Em seguida:

- conecte o ESP32 ao computador por USB
- confirme a porta serial disponível no sistema
- configure o back-end para abrir essa porta
- ligue o módulo PCM5102A às linhas de áudio digital do ESP32 e à saída P2 do circuito

### 5. Executar em produção

Fluxo recomendado:

```bash
cd frontend
npm run build

cd ../backend
npm install
npm run start
```

