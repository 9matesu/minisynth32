#!/usr/bin/env python3
"""
Script para formatacao de referencias bibliograficas ABNT
Uso: python formatar_referencias.py arquivo_referencias.txt
"""

import re
import sys
from typing import List, Dict


def formatar_livro(linha: str) -> str:
    """Formata referencia de livro seguindo ABNT NBR 6023"""
    # Formato esperado: SOBRENOME, Nome. Titulo. ed. Local: Editora, Ano.
    partes = linha.split('.')
    if len(partes) >= 2:
        autor = partes[0].strip()
        titulo = partes[1].strip()
        # Verificar se tem edicao
        if len(partes) >= 3:
            edicao = partes[2].strip()
            return f"{autor}. {titulo}. {edicao}."
    return linha


def formatar_artigo(linha: str) -> str:
    """Formata referencia de artigo em periodico"""
    # Formato: SOBRENOME, Nome. Titulo. Periodico, Local, v. X, n. Y, p. Z-W, Ano.
    return linha


def formatar_web(linha: str) -> str:
    """Formata referencia de pagina web"""
    # Formato: ORGANIZACAO. Titulo. Disponivel em: URL. Acesso em: Data.
    return linha


def formatar_citacao(linha: str) -> str:
    """Formata citacao no texto"""
    # Formato: (AUTOR, ANO, p. X)
    return linha


def ler_referencias(arquivo: str) -> List[str]:
    """Le arquivo de referencias"""
    try:
        with open(arquivo, 'r', encoding='utf-8') as f:
            return [linha.strip() for linha in f.readlines() if linha.strip()]
    except FileNotFoundError:
        print(f"Arquivo nao encontrado: {arquivo}")
        return []


def ordenar_alfabeticamente(referencias: List[str]) -> List[str]:
    """Ordena referencias em ordem alfabetica"""
    return sorted(referencias, key=lambda x: x.split(',')[0].upper() if ',' in x else x.upper())


def validar_formato(referencia: str) -> Dict[str, bool]:
    """Valida se a referencia segue o formato ABNT"""
    erros = {
        'tem_autor': ',' in referencia,
        'tem_titulo': '. ' in referencia,
        'tem_ponto_final': referencia.endswith('.'),
        'sem_pontos_duplos': '..' not in referencia
    }
    return erros


def main():
    if len(sys.argv) < 2:
        print("Uso: python formatar_referencias.py arquivo_referencias.txt")
        print("\nO arquivo deve conter uma referencia por linha.")
        print("Exemplo:")
        print("  SOBRENOME, Nome. Titulo do Livro. ed. Local: Editora, Ano.")
        sys.exit(1)
    
    arquivo = sys.argv[1]
    referencias = ler_referencias(arquivo)
    
    if not referencias:
        print("Nenhuma referencia encontrada.")
        sys.exit(1)
    
    print(f"Total de referencias: {len(referencias)}\n")
    
    # Ordenar
    referencias_ordenadas = ordenar_alfabeticamente(referencias)
    
    # Validar e formatar
    referencias_formatadas = []
    for ref in referencias_ordenadas:
        erros = validar_formato(ref)
        if not all(erros.values()):
            print(f"ATENCAO: {ref}")
            for erro, valido in erros.items():
                if not valido:
                    print(f"  - {erro}: formato incorreto")
        referencias_formatadas.append(ref)
    
    # Gerar saida
    saida = "REFERENCIAS\n\n"
    for ref in referencias_formatadas:
        saida += f"{ref}\n\n"
    
    # Salvar
    arquivo_saida = arquivo.replace('.txt', '_formatado.txt')
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        f.write(saida)
    
    print(f"\nArquivo formatado salvo em: {arquivo_saida}")


if __name__ == "__main__":
    main()