# 📱 Guia: Cadastro Rápido por IMEI via Leitor de Código de Barras

## ✅ O que foi implementado?

Sistema de cadastro inteligente que permite cadastrar aparelhos em menos de 10 segundos usando leitor de código de barras físico (USB/Bluetooth).

---

## 🗄️ Passo 1: Executar SQL no Supabase

### **Arquivo**: `supabase-tac-database.sql`

1. Acesse https://supabase.com
2. Abra seu projeto
3. Clique em **SQL Editor**
4. Copie TODO o conteúdo do arquivo `supabase-tac-database.sql`
5. Cole no editor
6. Clique em **Run**
7. Aguarde a mensagem: "Tabela TAC criada com sucesso! 38 TACs inseridos."

---

## 🚀 Passo 2: Acessar o Sistema

### **URL**: http://localhost:3000/imeis/cadastro-rapido

Ou pelo menu lateral:
```
IMEIs → Cadastro Rápido
```

---

## 📋 Como Usar

### **Fluxo Rápido:**

1. **Clique no campo** "Escaneie ou bipe o IMEI"
2. **Bipe o código de barras** da caixa do aparelho
3. **Sistema identifica automaticamente** marca e modelo
4. **Preencha**:
   - Capacidade (128GB, 256GB, 512GB, 1TB)
   - Cor (Preto, Branco, Azul, Titânio, etc.)
   - Custo (R$)
   - Preço de Venda (R$)
5. **Clique em "Salvar Aparelho"**
6. **Sistema volta automaticamente** para o campo de leitura
7. **Bipe o próximo aparelho** (modo entrada em massa)

---

## 🔧 Funcionamento Técnico

### **Leitor de Código de Barras:**
- ✅ Funciona como teclado (HID Keyboard)
- ✅ Não precisa de drivers
- ✅ Compatível com USB e Bluetooth
- ✅ Compatível com leitores 1D e 2D

### **Processo Automático:**
1. Leitor envia os 15 dígitos do IMEI
2. Sistema detecta a tecla ENTER
3. Valida o IMEI (algoritmo de Luhn)
4. Extrai o TAC (8 primeiros dígitos)
5. Consulta a base de dados TAC
6. Identifica: Marca, Fabricante, Modelo
7. Exibe preview do aparelho
8. Usuário completa com capacidade, cor, custo e preço
9. Salva automaticamente

### **Validações:**
- ✅ Tamanho correto (15 dígitos)
- ✅ Dígito verificador (Luhn)
- ✅ IMEI não duplicado
- ✅ TAC existente na base

---

## 🎯 Recursos

### **Identificação Automática:**
- 📱 iPhone (todos os modelos)
- 📱 Samsung (Galaxy S, A, etc.)
- 📱 Xiaomi (Redmi, Mi, etc.)

### **Feedback Visual:**
- ✅ Som de confirmação (beep)
- ✅ Toast verde de sucesso
- ✅ Animação de sucesso
- ✅ Preview do aparelho identificado

### **Modo Entrada em Massa:**
- ⚡ Cadastro rápido consecutivo
- 🔄 Foco automático no campo de leitura
- 💾 Salvamento automático
- 🧹 Limpeza automática do formulário

---

## 📊 Base de Dados TAC

### **Tabela**: `device_tac_database`

**Campos:**
- `tac` - 8 primeiros dígitos do IMEI
- `manufacturer` - Fabricante
- `brand` - Marca
- `model` - Modelo

**Exemplos incluídos:**
- 38 TACs de iPhones, Samsung e Xiaomi

### **Gerenciar TACs:**

Para adicionar/editar TACs, execute no Supabase:

```sql
-- Adicionar novo TAC
INSERT INTO device_tac_database (tac, manufacturer, brand, model)
VALUES ('35678999', 'Apple', 'Apple', 'iPhone 16 Pro Max');

-- Listar todos os TACs
SELECT * FROM device_tac_database ORDER BY brand, model;

-- Atualizar TAC
UPDATE device_tac_database 
SET model = 'iPhone 16 Pro Max'
WHERE tac = '35678999';

-- Excluir TAC
DELETE FROM device_tac_database WHERE tac = '35678999';
```

---

## 🧪 Teste Agora

1. **Execute o SQL** no Supabase
2. **Acesse**: http://localhost:3000/imeis/cadastro-rapido
3. **Bipe um IMEI** de iPhone (ex: 356789123456789)
4. **Veja a mágica acontecer!**

---

## 📦 GitHub

https://github.com/Luizbarreto71/Poderosoiphones.git

---

## 🎯 Próximos Passos

- [ ] Adicionar mais TACs (outras marcas)
- [ ] Importar CSV de TACs
- [ ] Modo offline (PWA)
- [ ] Impressão de etiquetas
- [ ] Integração com PDV

---

**Sistema pronto para uso! 🚀**