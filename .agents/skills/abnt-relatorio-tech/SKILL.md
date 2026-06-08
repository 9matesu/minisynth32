---
name: abnt-relatorio-tech
description: Escreve relatorios tecnicos ABNT sobre projetos ESP32+React com templates prontos. Use quando precisar criar relatorio tecnico, monografia ou documento academico sobre projeto com ESP32 e React, ou quando mencionar ABNT, formatacao academica, ou documento universitario.
---

# Relatorio Tecnico ABNT - ESP32+React

## Inicio Rapido

1. Escolha o tipo de documento (Relatorio Tecnico)
2. Use os templates em `TEMPLATES/` como base
3. Siga as regras ABNT em `REFERENCIA_ABNT.md`
4. Consulte exemplos em `EXEMPLOS/`

## Estrutura do Documento

```
1. Capa
2. Folha de Rosto
3. Resumo
4. Lista de Figuras/Tabelas (se houver)
5. Sumario
6. Introducao
7. Fundamentacao Teorica
8. Metodologia
9. Resultados e Discussao
10. Conclusoes
11. Referencias
12. Anexos (se houver)
```

## Formatacao Basica ABNT

| Elemento | Especificacao |
|----------|---------------|
| Fonte | Times New Roman 12pt (corpo), 14pt (titulos) |
| Espacamento | 1.5 entre linhas |
| Margens | Esq: 3cm, Dir: 2cm, Sup: 3cm, Inf: 2cm |
| Paragrafo | 1.25cm da esquerda |
| Numeracao | Paginas no canto inferior direito |
| Titulos | Centralizados, em negrito |

## Regras para ESP32+React

### Componentes Tecnicos
- Documentar: hardware, firmware, software, comunicacao
- Incluir diagramas de circuito e fluxo
- Especificar versoes de bibliotecas e frameworks
- Justificar escolhas tecnicas

### Codigos e Algoritmos
- Usar fonte monoespacada (Courier New 10pt)
- Numerar linhas se relevante
- Incluir apenas trechos essenciais
- Comentar logicas complexas

## Workflows

### Criar Documento Completo
1. Preencher `TEMPLATES/capa.md`
2. Preencher `TEMPLATES/folha.md`
3. Escrever `TEMPLATES/resumo.md`
4. Desenvolver secoes principais
5. Gerar `TEMPLATES/referencias.md`
6. Revisar com `CHECKLIST.md`

### Adicionar Secao
1. Copiar template da secao correspondente
2. Substituir placeholders `{{variavel}}`
3. Manter formatacao ABNT
4. Incluir citacoes quando necessario

## Avancado

- Consulte `REFERENCIA_ABNT.md` para regras detalhadas
- Veja `EXEMPLOS/` para exemplos preenchidos
- Use scripts em `scripts/` para formatacao automatica