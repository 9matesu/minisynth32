# EXEMPLO - Relatorio Tecnico ESP32+React

<br>

## Exemplo de Secao: Fundamentacao Teorica

<br>

### 2.1 Microcontrolador ESP32

O ESP32 e um microcontrolador desenvolvido pela Espressif Systems, projetado especificamente para aplicacoes IoT (Internet of Things). Segundo MORIM (2020, p. 145), "o ESP32 representa um salto significativo em relacao ao ESP8266, oferecendo maior poder de processamento e conectividade".

Suas principais caracteristicas incluem:
- Processador dual-core a 240 MHz
- Memoria flash de 512 KB a 16 MB
- WiFi 802.11 b/g/n
- Bluetooth 4.2 e BLE
- 34 pinos GPIO
- Conversores ADC de 12 bits

### 2.2 Framework React

React e uma biblioteca JavaScript desenvolvida pelo Meta para construcao de interfaces de usuario. De acordo com a documentacao oficial (REACT, 2023), "React permite criar interfaces de usuario declarativas e eficientes".

Componentes em React sao funcoes ou classes que retornam JSX, uma extensao de sintaxe do JavaScript. O ciclo de vida dos componentes inclui montagem, atualizacao e desmontagem.

### 2.3 Comunicacao MQTT

O protocolo MQTT (Message Queuing Telemetry Transport) e amplamente utilizado em aplicacoes IoT. SILVA e SANTOS (2021, p. 78) destacam que "o MQTT foi projetado para dispositivos com recursos limitados e redes de baixa largura de banda".

Caracteristicas principais:
- Protocolo leve baseado em publicacao/assinatura
- Qualidade de servico configuravel (QoS 0, 1, 2)
- Mensagens de Keep Alive
- Last Will and Testament (LWT)

---

<br>

## Exemplo de Secao: Metodologia

<br>

### 3.1 Tipo de Pesquisa

Este trabalho classifica-se como pesquisa aplicada, com abordagem experimental, pois envolve o desenvolvimento e testes de um prototipo funcional.

### 3.2 Ambiente de Desenvolvimento

#### Hardware
- **Microcontrolador:** ESP32-WROOM-32 (versao 3.0)
- **Sensores:**
  - DHT22 (temperatura e umidade)
  - LDR (luminosidade)
  - PIR (presenca)
- **Atuadores:**
  - LED RGB
  - Rele 5V
  - Motor DC

#### Software
- **Firmware:** Arduino IDE 2.0.4
- **Bibliotecas:**
  - WiFi (v2.0)
  - PubSubClient (v2.8)
  - DHT sensor library (v1.4.4)
- **Frontend:**
  - React 18.2.0
  - Node.js 18.13.0
  - MQTT.js 4.3.7

### 3.3 Metodologia de Desenvolvimento

#### Fase 1: Planejamento (Semanas 1-2)
- Levantamento de requisitos
- Definicao da arquitetura
- Escolha de tecnologias

#### Fase 2: Desenvolvimento (Semanas 3-8)
- Implementacao do firmware
- Desenvolvimento da interface
- Integracao dos componentes

#### Fase 3: Testes (Semanas 9-10)
- Testes unitarios
- Testes de integracao
- Testes de desempenho

#### Fase 4: Documentacao (Semanas 11-12)
- Documentacao do codigo
- Redacao do relatorio
- Revisao final

---

<br>

## Exemplo de Secao: Resultados

<br>

### 4.1 Resultados Obtidos

#### 4.1.1 Funcionalidade do Firmware

O firmware desenvolvido apresentou as seguintes funcionalidades:
- Conexao WiFi estabelecida em tempo medio de 2.3 segundos
- Leitura de sensores a cada 5 segundos
- Publicacao de dados via MQTT com sucesso de 99.7%

#### 4.1.2 Interface React

A interface web apresentou:
- Tempo de carregamento inicial: 1.2 segundos
- Atualizacao de dados em tempo real
- Compativel com desktop e mobile

### 4.2 Analise dos Resultados

| Metrica | Resultado | Meta | Status |
|---------|-----------|------|--------|
| Tempo de resposta | 180ms | < 200ms | Alcancado |
| Consumo RAM | 45KB | < 64KB | Alcancado |
| Consumo flash | 890KB | < 1MB | Alcancado |
| Taxa de erro | 0.3% | < 1% | Alcancado |

### 4.3 Limitacoes

1. Alcance WiFi limitado a 30 metros em ambiente interno
2. Consumo de energia nao otimizado para bateria
3. Nao implementado protocolo HTTPS

---

<br>

## Exemplo de Referencias

<br>

MORIM, Eduardo. Introducao a Sistemas Microcontroladores. 3. ed. Sao Paulo: Editora Tecnica, 2020.

REACT. Documentacao Oficial do React. v. 18.0. Disponivel em: https://reactjs.org. Acesso em: 10 fev. 2023.

SILVA, Joao; SANTOS, Maria. IoT com ESP32 e MQTT. Revista de Eletronica, Sao Paulo, v. 15, n. 3, p. 45-52, 2021.

ESPRESSIF. ESP32 Technical Reference Manual. v. 5.0. Disponivel em: https://www.espressif.com. Acesso em: 15 jan. 2023.