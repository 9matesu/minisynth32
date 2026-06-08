<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; text-align: justify;">

<div style="text-align: center; font-weight: bold; font-size: 14pt;">
FACULDADE DE TECNOLOGIA<br>
Fatec Cruzeiro – Prof. Waldomiro May<br>
Coordenação de Cursos
</div>

<br><br><br><br><br><br>

<div style="text-align: center; font-weight: bold; font-size: 14pt;">
MATEUS COSTA DE OLIVEIRA SANTOS<br>
RAFAEL AUGUSTO GARCEZ ELISEI
</div>

<br><br><br><br><br><br><br><br>

<div style="text-align: center; font-weight: bold; font-size: 14pt;">
RELATÓRIO FINAL DE PROJETO DE CURRICULARIZAÇÃO DA EXTENSÃO:<br>
SINTETIZADOR "MINISYNTH32"
</div>

<br><br><br><br><br><br><br><br><br><br><br><br><br>

<div style="text-align: center; font-size: 12pt;">
Cruzeiro - SP<br>
2026
</div>

<div style="page-break-after: always;"></div>

<!-- Folha de Rosto -->
<div style="text-align: center; font-weight: bold; font-size: 14pt;">
MATEUS COSTA DE OLIVEIRA SANTOS<br>
RAFAEL AUGUSTO GARCEZ ELISEI
</div>

<br><br><br><br><br><br>

<div style="text-align: center; font-weight: bold; font-size: 14pt;">
SINTETIZADOR "MINISYNTH32"
</div>

<br><br><br><br><br>

<div style="margin-left: 45%; text-align: justify; font-size: 10pt; line-height: 1.2;">
Relatório Final de Projeto de Curricularização da Extensão, apresentado como requisito para avaliação nas disciplinas de Programação para Dispositivos Móveis e Sistemas Operacionais II, no curso de graduação da Faculdade de Tecnologia - Fatec Cruzeiro.
<br><br>
Professores Orientadores: Carlos Henrique Loureiro Feichas e Eduardo Compasso Arbex.
</div>

<br><br><br><br><br><br><br><br><br><br><br><br>

<div style="text-align: center; font-size: 12pt;">
Cruzeiro - SP<br>
2026
</div>

<div style="page-break-after: always;"></div>

<!-- Resumo -->
<div style="text-align: center; font-weight: bold; font-size: 14pt;">
RESUMO
</div>
<br>

O Sintetizador “minisynth32” é um sintetizador subtrativo digital de baixo custo, desenvolvido com hardware acessível e software de código aberto, concebido para uso didático e em escolas e centros educacionais especializados ou não. O projeto integra o microcontrolador ESP32-S3 ao ecossistema web por meio de um servidor Node.js, persistindo parâmetros em banco de dados utilizando SQLite e expondo uma interface em React inspirada visualmente em sintetizadores clássicos de mercado. O objetivo principal desta iniciativa é viabilizar uma ferramenta de aprendizado prático, exploratória e inclusiva para ambientes educacionais e afins, mitigando a barreira econômica que equipamentos dessa natureza costumam impor. O resultado do projeto engloba não apenas o hardware prototipado com capacidades MIDI, mas também uma comunicação estável bidirecional em tempo real (via WebSocket) que reflete o controle sonoro físico diretamente em uma aplicação web fluida.

<br>
**Palavras-chave:** Sintetizador. ESP32-S3. Síntese Subtrativa. Educação Musical. React.

<div style="page-break-after: always;"></div>

<!-- Sumário -->
<div style="text-align: center; font-weight: bold; font-size: 14pt;">
SUMÁRIO
</div>
<br>

**1. INTRODUÇÃO** ......................................................................................................... 5<br>
**2. FUNDAMENTAÇÃO TEÓRICA** ........................................................................... 6<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.1 Síntese Subtrativa** .......................................................................................... 6<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.2 Osciladores** ...................................................................................................... 6<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.3 Filtros** ............................................................................................................... 7<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.4 Envelope ADSR** .............................................................................................. 7<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.5 Arpeggiador** .................................................................................................... 7<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.6 MIDI** ................................................................................................................. 8<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.7 Microcontrolador ESP32-S3 e Geração de Áudio Digital** ......................... 8<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.8 C++** ................................................................................................................... 8<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.9 Node.js e Express** .......................................................................................... 8<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.10 WebSocket** ..................................................................................................... 9<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.11 SQLite** ............................................................................................................ 9<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.12 React** ............................................................................................................... 9<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.13 Linux e Git** ..................................................................................................... 9<br>
&nbsp;&nbsp;&nbsp;&nbsp;**2.14 Curricularização do projeto** ........................................................................ 10<br>
**3. METODOLOGIA E DESENVOLVIMENTO** ...................................................... 11<br>
**4. RESULTADOS E IMPACTOS** ............................................................................... 15<br>
**5. ANÁLISE CRÍTICA E CONSIDERAÇÕES FINAIS** ......................................... 16<br>
**6. REFERÊNCIAS** ........................................................................................................ 17<br>

<div style="page-break-after: always;"></div>

<div style="text-align: center; font-weight: bold; font-size: 14pt;">
1. INTRODUÇÃO
</div>
<br>

O Sintetizador “minisynth32” é um sintetizador subtrativo digital de baixo custo, desenvolvido com hardware acessível e software de código aberto, concebido para uso didático e em escolas e centros educacionais especializados ou não. O projeto integra o microcontrolador ESP32-S3 ao ecossistema web por meio de um servidor Node.js, persistindo parâmetros em banco de dados utilizando SQLite e expondo uma interface em React inspirada visualmente em sintetizadores clássicos de mercado.

A motivação central do projeto nasce de uma barreira econômica existente no país, onde sintetizadores analógicos comerciais costumam ultrapassar R$ 3.000,00 no mercado devido a custos de importação, baixa demanda e inexistência de cadeias produtivas no ramo, restringindo o acesso de músicos, produtores musicais, entusiastas, estudantes, professores e instituições de ensino a esse tipo de instrumento (ANTUNES; RIBEIRO; THOMASI, 2022; LINTZ MAUÉS, 1989). A ausência de contato tátil com teclas, potenciômetros e controles sonoros limita a compreensão prática de conceitos de síntese, *sound design*, acústica e musicalidade.

Diante disso, a equipe se propôs a construir um protótipo funcional capaz de reproduzir as principais funcionalidades de um sintetizador convencional, porém utilizando componentes acessíveis e arquitetura modular. O objetivo é viabilizar uma ferramenta de aprendizado prático, exploratória e inclusiva para ambientes educacionais e afins.

<div style="text-align: center; font-weight: bold; font-size: 14pt; margin-top: 2em;">
2. FUNDAMENTAÇÃO TEÓRICA
</div>
<br>

**2.1 Síntese Subtrativa**
<br>
A metodologia de síntese subtrativa constitui o pilar fundamental para a arquitetura de geração sonora em sistemas eletrônicos, abrangendo tanto implementações analógicas quanto digitais. O processo baseia-se na utilização de fontes sonoras ricas em harmônicos, geradas por osciladores, as quais foram submetidas a uma moldagem progressiva via filtragem, envelopes e modulações para a remoção de frequências indesejadas na composição do timbre (EMASTERED, 2023). O fluxo de processamento padrão é estabelecido pela cadeia: Oscilador → Filtro → Amplificador, integrada a envelopes ADSR para o controle da dinâmica temporal.

Este paradigma consolidou-se na década de 1960 com o surgimento dos sistemas modulares de Robert Moog. A posterior introdução do Minimoog em 1970 serviu para padronizar essa arquitetura de sinal, tornando-a a principal referência para o mercado até a contemporaneidade. O sintetizador MFB Synth Lite 2, cujas características estéticas e funcionais serviram de inspiração para este projeto, exemplifica a continuidade desse modelo nos anos 2000.

Na presente proposta, a síntese é executada via firmware no microcontrolador ESP32-S3, responsável pelo processamento digital dos parâmetros sonoros antes da conversão pelo módulo DAC PCM5102A. Tal abordagem preserva a essência do método analógico, promovendo a acessibilidade em ambientes pedagógicos ao eliminar a necessidade de componentes de alto custo financeiro.

<br>
**2.2 Osciladores**
<br>
O oscilador atua como o estágio inicial do fluxo subtrativo, encarregado de gerar a matéria-prima acústica. Sua função primordial é a produção de ondas contínuas em frequências específicas, interpretadas pelo usuário como altura musical (*pitch*). Enquanto a frequência determina a nota, o formato da onda define o espectro harmônico e a identidade tímbrica do sinal (NATIVE INSTRUMENTS, 2023).

Fisicamente, a forma de onda representa variações de amplitude temporal. De acordo com a série de Fourier, sinais periódicos podem ser decompostos em senóides múltiplas da frequência fundamental, sendo este conteúdo harmônico o fator distintivo entre diferentes timbres (NATIVE INSTRUMENTS, 2023; EMASTERED, 2023). As ondas implementadas neste sintetizador são:

1. Senoidal (Sine): sinal puro sem harmônicos extras, ideal para a criação de sub-graves e texturas limpas.
2. Dente de serra (Sawtooth): harmonicamente rica, contendo todos os harmônicos, sendo a base para pads e leads clássicos.
3. Quadrada (Square): composta por harmônicos ímpares, remete a instrumentos vintage e permite modulação de largura de pulso (PWM).
4. Triangular (Triangle): apresenta harmônicos ímpares com decaimento exponencial, resultando em um timbre suave com leve textura.
5. Ruído (Noise): energia aleatória distribuída no espectro, utilizada para efeitos percussivos e texturização sonora.

O projeto disponibiliza dois osciladores independentes (OSC1 e OSC2), com controles de afinação (Coarse e Fine), seleção de oitavas e mixagem. O segundo oscilador suporta modulação PWM, permitindo a criação de timbres complexos e efeitos de *detune* que enriquecem a sonoridade do instrumento.

<br>
**2.3 Filtros**
<br>
O filtro é o elemento central na definição do caráter subtrativo. Sua operação consiste na atenuação de faixas do espectro do oscilador, moldando o resultado tímbrico final. Enquanto em sistemas analógicos é denominado VCF, em plataformas digitais como esta é conhecido como DCF (NATIVE INSTRUMENTS, 2023).

O parâmetro *Cutoff* estabelece a frequência de corte, onde a atenuação ocorre gradualmente (dB/oitava). Filtros de 24 dB/oct proporcionam o corte acentuado típico de sintetizadores icônicos. O projeto contempla dois modos principais: LPF (Passa-Baixas), para sons encorpados, e HPF (Passa-Altas), para timbres brilhantes e aéreos.

A Ressonância amplifica as frequências próximas ao corte, podendo atingir auto-oscilação em valores extremos. O controle de inclinação (Slope) e o envelope ADSR compartilhado permitem a evolução dinâmica do timbre, viabilizando modulações em tempo real essenciais para a performance musical.

<br>
**2.4 Envelope ADSR**
<br>
O gerador de envelope regula a progressão temporal de parâmetros como amplitude ou frequência. O modelo ADSR define quatro estágios cruciais: Attack (velocidade inicial), Decay (transição dinâmica), Sustain (nível de manutenção) e Release (tempo de decaimento final) (NATIVE INSTRUMENTS, 2023; EMASTERED, 2023).

Neste sistema, aplica-se um envelope ADSR compartilhado, que atua simultaneamente na modulação do filtro e na amplitude global. Tal configuração possibilita a geração de uma ampla diversidade sonora, desde sons percussivos curtos até ambiências atmosféricas de longa duração de maneira coesa.

<br>
**2.5 Arpeggiador**
<br>
Este sequenciador transforma acordes em sequências melódicas automáticas, baseando-se em padrões rítmicos e ordens configuráveis. No contexto educativo, o arpeggiador facilita a exploração intuitiva de escalas e progressões harmônicas, permitindo que estudantes criem frases musicais complexas sem a necessidade de treinamento técnico prévio no instrumento.

Os controles incluem padrões de direção (subida, descida ou aleatório), alcance de oitavas e subdivisões temporais integradas ao sinal MIDI.

<br>
**2.6 MIDI**
<br>
O protocolo MIDI, estabelecido em 1983, padroniza a comunicação entre equipamentos musicais, transmitindo dados de performance em vez de áudio direto (UFRGS, 2015; WIKIPEDIA, 2005). Mensagens como Note On/Off e Control Change (CC) permitem o comando preciso dos parâmetros do sintetizador.

A integração USB MIDI no ESP32-S3 simplifica o hardware e reduz custos, eliminando conectores legados. O mapeamento de parâmetros é persistido no banco de dados SQLite, assegurando flexibilidade para o uso de controladores externos.

<br>
**2.7 Microcontrolador ESP32-S3 e Geração de Áudio Digital**
<br>
O ESP32-S3, com arquitetura Xtensa LX7 e clock de 240 MHz, oferece o poder computacional necessário para a síntese monofônica em tempo real. Sua funcionalidade nativa USB possibilita a implementação de MIDI e processamento de áudio com latência reduzida (ESPRESSIF SYSTEMS, 2022).

A transmissão de dados utiliza o barramento I²S para o DAC PCM5102A, que realiza a conversão para áudio estéreo de alta fidelidade (112 dB SNR). A integração deste módulo exige a soldagem dos jumpers em sua placa inferior (pinos H1L, H2L, H3H e H4L) para ajustar corretamente os filtros digitais e o formato I²S. Operando a 44,1 kHz e 32 bits, o sistema atende aos critérios do Teorema de Nyquist-Shannon, garantindo qualidade profissional em conformidade com os padrões da indústria (TEXAS INSTRUMENTS, 2015).

A saída via conector P2 viabiliza o uso direto de fones e monitores ativos, reforçando a portabilidade e a viabilidade do protótipo para fins didáticos em ambientes de uso educacional.

<br>
**2.8 C++**
<br>
A programação do firmware é realizada em C++, linguagem que amplia o paradigma procedimental do C com recursos de abstração, organização em módulos e melhor estruturação do código para sistemas embarcados. Em um projeto como este, em que coexistem rotinas de geração de áudio, leitura de controles, comunicação MIDI e integração com DAC, o uso de C++ favorece a manutenção e a separação lógica entre componentes do firmware.

<br>
**2.9 Node.js e Express**
<br>
O Node.js atua como um ambiente de execução JavaScript direcionado a eventos, exercendo a função de intermediário entre o firmware embarcado, a interface de usuário e a base de dados. No ecossistema do "minisynth32", esta camada centraliza a comunicação serial com o microcontrolador ESP32-S3, expondo uma API REST e servindo o front-end em um processo unificado, o que reduz a fragmentação sistêmica (NODE.JS FOUNDATION, 2026).

Integrado a este ambiente, o framework Express oferece uma estrutura minimalista e flexível para a gestão de rotas e middlewares. Sua aplicação é estratégica para o gerenciamento de *presets*, mapeamentos MIDI e estados operacionais do sintetizador, viabilizando uma organização modular sem impor rigidez arquitetônica excessiva ao desenvolvimento do projeto.

<br>
**2.10 WebSocket**
<br>
O protocolo WebSocket estabelece um canal de comunicação bidirecional e persistente, essencial para aplicações que demandam atualizações contínuas de estado. Diferente do modelo tradicional de requisições HTTP, esta tecnologia mantém o fluxo de dados aberto, permitindo a troca de informações com reduzida sobrecarga de cabeçalhos e maior eficiência no processamento rítmico.

No contexto do instrumento, o WebSocket assegura a sincronia imediata entre a interface e o hardware durante a manipulação de parâmetros como *cutoff*, ressonância e osciladores. Essa baixa latência é crucial em sistemas musicais interativos, garantindo que o instrumentista perceba a resposta sonora instantânea às alterações realizadas na interface gráfica.

<br>
**2.11 SQLite**
<br>
O SQLite constitui um sistema de gerenciamento de banco de dados relacional autocontido e sem servidor, operando diretamente a partir de um único arquivo. Suas características de portabilidade e confiabilidade o tornam ideal para sistemas embarcados e aplicações de pequeno porte que exigem integridade de dados sem complexidade infraestrutural (SQLITE CONSORTIUM, 2026).

A escolha por este motor de persistência justifica-se pela necessidade de armazenar *presets* de síntese e configurações de mapeamento de forma eficiente em ambiente Linux. Ao evitar a necessidade de um servidor de banco de dados dedicado, o projeto reduz custos operacionais e simplifica o processo de implantação em laboratórios educacionais.

<br>
**2.12 React**
<br>
A interface de usuário é construída utilizando a biblioteca React, que propõe uma arquitetura baseada em componentes independentes e reutilizáveis. Este paradigma favorece a modularização do front-end, permitindo que cada seção do sintetizador, como osciladores e filtros, seja desenvolvida e atualizada dinamicamente conforme o estado do sistema.

No projeto, o React possibilita a criação de uma interface interativa que reflete os parâmetros sonoros com precisão visual. A estrutura componentizada facilita a implementação de controles como *knobs* e *sliders*, essenciais para a experiência de edição e carregamento de timbres.

<br>
**2.13 Linux e Git**
<br>
O Linux atua como o sistema operacional de código aberto que sustenta a camada de hospedagem do projeto. Sua estabilidade e ampla compatibilidade com ferramentas de desenvolvimento web e sistemas embarcados consolidam sua escolha como plataforma de *deploy* para o servidor do sintetizador. O controle de versão é gerenciado pelo Git, que assegura a rastreabilidade do código-fonte, facilitando a evolução modular do firmware, back-end e interface de forma eficiente.

<br>
**2.14 Curricularização do projeto**
<br>
No contexto escolar, o uso de um sintetizador didático favorece a aprendizagem interdisciplinar, aproximando conceitos de eletrônica, programação, matemática e música, não sendo uma ideia exclusiva. O caráter tátil do instrumento é especialmente relevante, pois a manipulação direta de potenciômetros e controles físicos cria uma relação imediata entre ação e resultado sonoro (RIBEIRO; HURTADO; THOMASI, 2022). Ao utilizar tecnologias abertas e componentes de baixo custo, o projeto contribui para reduzir barreiras de acesso a recursos normalmente restritos a nichos elitizados, alinhando-se à democratização do ensino tecnológico e musical.

Como parte do projeto de curricularização, o projeto atende diretamente ao ODS 4 (Educação de Qualidade) e ao ODS 10 (Redução das Desigualdades), promovendo experiências práticas de aprendizado em ambientes de ensino público, especialmente focado em oficinas de música eletrônica.

<div style="text-align: center; font-weight: bold; font-size: 14pt; margin-top: 2em;">
3. METODOLOGIA E DESENVOLVIMENTO
</div>
<br>

O desenvolvimento do projeto foi organizado em etapas sequenciais, permitindo controle progressivo da implementação e rastreabilidade entre requisitos e solução construída. As principais fases foram:

**3.1 Plano de construção**
<br>
Elaboração do documento inicial do projeto, com definição da ideia, escopo e objetivos.

**3.2 Levantamento de requisitos**
<br>
Definição dos requisitos funcionais e não funcionais do hardware, back-end e front-end. Esta etapa envolveu a estipulação técnica da geração de áudio, síntese monofônica, recepção serial no servidor, rotas de API REST, persistência em SQLite, e design responsivo inspirado em estéticas clássicas com interatividade via WebSocket. Foram delimitadas latências rigorosas de áudio (< 10ms) e rede (< 50ms) a fim de preservar a viabilidade musical do equipamento.

**3.3 Modelagem e arquitetura**
<br>
A estruturação da comunicação consistiu no intercâmbio de dados entre ESP32 (via USB-Serial), o servidor Node.js operando de intermediário, o banco SQLite guardando os presets, e a interface React operando na ponta do usuário de forma reativa.

**3.4 Desenvolvimento**
<br>
A codificação ocorreu fragmentada, priorizando primeiro o *firmware* e sua geração de onda com a biblioteca *esp32_audio*, logo em seguida acoplando a leitura de potenciômetros A/D. Na sequência o desenvolvimento focou no *back-end* expondo o protocolo WebSocket e o parser das informações binárias e seriais, para finalmente culminar no *front-end* criando *knobs* SVG interativos.

**3.5 Integração e validação**
<br>
Os testes consistiram na interligação do hardware provisório em uma *protoboard*, onde foram dispostos o display OLED SH1106 (resolução de 128x64 pixels e 1,3 polegadas) e 5 potenciômetros de 10 kΩ, os quais demandaram soldagem com estanho em seus terminais para assegurar estabilidade na leitura analógica. A etapa envolveu a verificação dos pacotes transitados em rede, a validação de que as alterações de hardware refletiam imediatamente na renderização da UI, e o teste da fidelidade acústica com o DAC PCM5102A conectado aos fones de ouvido.

**3.6 Tecnologias**
<br>
As tecnologias utilizadas englobam ferramentas de sistemas embarcados, desenvolvimento web e persistência de dados. O projeto foi estruturado para operar em ambiente Linux, com comunicação em tempo real e baixo acoplamento entre as camadas do sistema:
- **Firmware:** ESP32-S3 / C++ / ESP-IDF (Geração de áudio, leitura de controles e comunicação MIDI)
- **Back-End:** Node.js + Express (API REST e integração)
- **Tempo real:** WebSocket (Troca bidirecional de parâmetros)
- **Banco de Dados:** SQLite (Persistência de presets e mapeamentos)
- **Front-End:** React (Interface visual de controle)

Além dos artefatos de software, os principais componentes físicos previstos para a montagem em protoboard incluem: o microcontrolador ESP32-S3, o módulo DAC estéreo PCM5102A (com a soldagem obrigatória dos pinos H1L, H2L, H3H e H4L), um display OLED SH1106 de 128x64 pixels (1,3 polegadas), 5 potenciômetros de 10 kΩ (com terminais soldados com estanho para estabilidade de contato), saídas de áudio P2 e conexão USB para alimentação e comunicação MIDI/Serial.

<div style="text-align: center; font-weight: bold; font-size: 14pt; margin-top: 2em;">
4. RESULTADOS E IMPACTOS
</div>
<br>

O projeto resultou na definição de um sintetizador digital com foco em acessibilidade, interatividade e aplicação pedagógica. Entre as funcionalidades previstas e implementadas estão dois osciladores independentes em operação monofônica, filtro HPF/LPF com envelope ADSR compartilhado com a amplitude, arpeggiador, integração MIDI e armazenamento de presets.

A comunicação entre o ESP32 e o sistema web foi validada via conexão serial USB com retransmissão ao front-end por WebSocket em tempo real. Essa arquitetura permitiu a visualização instantânea dos parâmetros e sua alteração remota pela interface gráfica de modo totalmente coerente e sem perdas de quadros.

O impacto alcançado atendeu a proposta de proporcionar contato tátil e aprendizado ativo, despertando o interesse por música e programação através do ecossistema de *open-source* com um custo material consideravelmente mais brando do que equipamentos importados de marca.

<div style="text-align: center; font-weight: bold; font-size: 14pt; margin-top: 2em;">
5. ANÁLISE CRÍTICA E CONSIDERAÇÕES FINAIS
</div>
<br>

O sintetizador se apresenta como uma solução coerente com os objetivos acadêmicos do curso e com a proposta de curricularização voltada à resolução de problemas presentes em meio a comunidade. Sua principal contribuição está em demonstrar que é possível construir uma ferramenta musical funcional com custo reduzido e tecnologia aberta.

Do ponto de vista técnico, a divisão em camadas entre firmware, back-end, banco de dados e front-end favorece a manutenção, evolução do sistema e testes por etapas. Desafios de comunicação inter-processos e debouncing de interrupções analógicas foram superados com algoritmos de suavização.

Mesmo estando em formato de protótipo, o projeto já estabelece uma base sólida para versões futuras, como a adição de gabinetes de acrílico ou impressão 3D, expansão para módulos eurorack, ou a melhoria de efeitos de pós-processamento (Delay/Reverb) direto no microcontrolador. O caráter didático e economicamente acessível do instrumento se concretizou com êxito.

<div style="page-break-after: always;"></div>

<div style="text-align: center; font-weight: bold; font-size: 14pt;">
6. REFERÊNCIAS
</div>
<br>

<div style="text-indent: 0; margin-bottom: 1em;">
ESPRESSIF SYSTEMS. <b>ESP32-S3 Technical Reference Manual</b>. Disponível em: https://www.espressif.com/. Acesso em: maio de 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
FORNARI, José. <b>Softwares e hardwares musicais livres para o ensino musical</b>. 2020. Preprint. Disponível em: &lt;https://www.researchgate.net/publication/...&gt;. Acesso em: 26 maio 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
NODE.JS FOUNDATION. <b>Node.js Documentation</b>. Disponível em: https://nodejs.org/. Acesso em: maio de 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
RIBEIRO, Felipe de Almeida; HURTADO, Antonio Spoladore; THOMASI, Ricardo. <b>Revisitando o sintetizador analógico como ambiente de experimentação e aprendizado</b>. In: XXXII CONGRESSO DA ASSOCIAÇÃO NACIONAL DE PESQUISA E PÓS-GRADUAÇÃO EM MÚSICA – ANPPOM, 32., 2022, Natal. Anais [...]. Natal: ANPPOM, 2022. p. 1–19.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
RIBEIRO, Felipe de Almeida; THOMASI, Ricardo de Oliveira. <b>Mapping Out the Origins of Electroacoustic Music Studios in Brazil</b>. Computer Music Journal, v. 46, n. 1-2, p. 94–107, 2022.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
SQLITE CONSORTIUM. <b>SQLite Documentation</b>. Disponível em: https://www.sqlite.org/docs.html. Acesso em: maio de 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
HTWTSCHKE, Henrik. <b>esp32_audio</b>. GitHub. Disponível em: https://github.com/htw1512/esp32_audio. Acesso em: maio de 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
NATIVE INSTRUMENTS. <b>How does a subtractive synthesis work?</b> Blog Native Instruments. Disponível em: https://blog.native-instruments.com/subtractive-synthesis/. Acesso em: 28 maio 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
EMASTERED. <b>Síntese subtrativa: o que é e como funciona</b>. 2023. Disponível em: https://emastered.com/pt/blog/subtractive-synthesis. Acesso em: maio de 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
TEXAS INSTRUMENTS. <b>PCM5102A — Product Datasheet</b>. 2015. Disponível em: https://www.ti.com/product/PCM5102A. Acesso em: maio de 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
UFRGS. <b>O padrão MIDI</b>. Porto Alegre: Universidade Federal do Rio Grande do Sul, 2015. Disponível em: https://www.ufrgs.br/mvs/Periodo05-1983-MIDI_NEW.html. Acesso em: maio de 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
WIKIPEDIA. <b>MIDI</b>. 2005. Disponível em: https://pt.wikipedia.org/wiki/MIDI. Acesso em: maio de 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
EXPRESS. <b>Express - Node.js web application framework</b>. Disponível em: https://expressjs.com/. Acesso em: 28 maio 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
REACT. <b>React</b>. Disponível em: https://react.dev/. Acesso em: 28 maio 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
LINUX KERNEL ORGANIZATION. <b>Linux Kernel Documentation</b>. Disponível em: https://www.kernel.org/doc/. Acesso em: 28 maio 2026.
</div>

<div style="text-indent: 0; margin-bottom: 1em;">
GIT SCM. <b>Pro Git book</b>. Disponível em: https://git-scm.com/book/en/v2. Acesso em: 28 maio 2026.
</div>

</div>
