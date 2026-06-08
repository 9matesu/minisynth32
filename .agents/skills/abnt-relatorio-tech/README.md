# ABNT Relatorio Tecnico - ESP32+React

Skill para criacao de relatorios tecnicos academicos seguindo normas ABNT, especificamente para projetos com ESP32 e React.

## Como Usar

1. **Iniciar um novo documento:** Use os templates em `TEMPLATES/`
2. **Seguir a estrutura:** Siga a ordem das secoes no SKILL.md
3. **Consultar regras:** Veja `REFERENCIA_ABNT.md` para duvidas
4. **Verificar formato:** Use `CHECKLIST.md` para revisao

## Estrutura do Skill

```
abnt-relatorio-tech/
├── SKILL.md              # Instrucoes principais
├── REFERENCIA_ABNT.md    # Regras detalhadas ABNT
├── CHECKLIST.md          # Checklist de revisao
├── TEMPLATES/            # Templates prontos
│   ├── capa.md
│   ├── folha.md
│   ├── resumo.md
│   ├── introducao.md
│   ├── fundamentacao.md
│   ├── metodologia.md
│   ├── resultados.md
│   ├── conclusoes.md
│   └── referencias.md
├── EXEMPLOS/             # Exemplos preenchidos
│   └── exemplo_completo.md
└── scripts/              # Scripts de formatacao
    └── formatar_referencias.py
```

## Tipos de Documento Suportados

- Relatorio Tecnico (principal)
- Monografia/TCC
- Artigo Cientifico
- Proposta de Projeto

## Comandos Uteis

### Formatar Referencias
```bash
python scripts/formatar_referencias.py minhas_referencias.txt
```

### Verificar Ortografia (Linux/Mac)
```bash
aspell -p pt_BR -d pt_BR check documento.txt
```

## Recursos

- **Templates:** Preencha os placeholders `{{variavel}}` e `[chaves]`
- **Exemplos:** Veja como ficam as secoes preenchidas
- **Checklist:** Use para garantir que nada foi esquecido
- **Scripts:** Automatize formatacao de referencias

## Contribuicoes

Para melhorias ou correcoes, siga as normas ABNT atualizadas:
- NBR 14724:2011 - Trabalhos academicos
- NBR 6023:2018 - Referencias bibliograficas
- NBR 10520:2002 - Citacao em textos
- NBR 6024:2012 - Numeracao progressiva
- NBR 6028:1996 - Resumo