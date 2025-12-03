import React from "react";
import "./App.css";

interface Cliente {
  nomeCompleto: string;
  celular: string;
  endereco: string;
}

export default function App() {
  const [clientes, setClientes] = React.useState<Cliente[]>(() => {
    return JSON.parse(localStorage.getItem("clientes") || "[]");
  });

  const [filtro, setFiltro] = React.useState("");
  const [editIndex, setEditIndex] = React.useState<number | null>(null);

  const [form, setForm] = React.useState({
    nome: "",
    sobrenome: "",
    celular: "",
    cep: "",
    logradouro: "",
    bairro: "",
    cidade: "",
    uf: "",
    numero: "",
  });

  const clientesFiltrados = clientes.filter((c) =>
    c.nomeCompleto.toLowerCase().includes(filtro.toLowerCase())
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCepBlur() {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
      }));
    } catch {
      alert("Erro ao buscar o CEP.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cliente: Cliente = {
      nomeCompleto: `${form.nome} ${form.sobrenome}`,
      celular: form.celular,
      endereco: `${form.logradouro}, ${form.numero}, ${form.bairro}, ${form.cidade} - ${form.uf}`,
    };

    if (editIndex !== null) {
      const novos = [...clientes];
      novos[editIndex] = cliente;
      setClientes(novos);
      setEditIndex(null);
    } else {
      setClientes([...clientes, cliente]);
    }

    setForm({
      nome: "",
      sobrenome: "",
      celular: "",
      cep: "",
      logradouro: "",
      bairro: "",
      cidade: "",
      uf: "",
      numero: "",
    });
  }

  function editarCliente(index: number) {
    const cliente = clientes[index];
    const partesNome = cliente.nomeCompleto.split(" ");
    const nome = partesNome.slice(0, -1).join(" ");
    const sobrenome = partesNome.slice(-1)[0];

    const [logradouro, numero, bairro, cidadeUf] = cliente.endereco.split(", ");
    const [cidade, uf] = cidadeUf.split(" - ");

    setForm({
      nome,
      sobrenome,
      celular: cliente.celular,
      cep: "",
      logradouro,
      numero,
      bairro,
      cidade,
      uf,
    });

    setEditIndex(index);
  }

  function removerCliente(index: number) {
    if (window.confirm("Deseja realmente remover este cliente?")) {
      setClientes(clientes.filter((_, i) => i !== index));
      setEditIndex(null);
    }
  }

  React.useEffect(() => {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }, [clientes]);

  return (
    <div className="container">
      <h1>Cadastro de Clientes</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
          <input
            name="sobrenome"
            placeholder="Sobrenome"
            value={form.sobrenome}
            onChange={handleChange}
            required
          />
          <input
            name="celular"
            placeholder="Celular"
            value={form.celular}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            name="cep"
            placeholder="CEP"
            value={form.cep}
            onChange={handleChange}
            onBlur={handleCepBlur}
            maxLength={8}
            required
          />
          <input name="logradouro" placeholder="Logradouro" value={form.logradouro} readOnly />
          <input name="bairro" placeholder="Bairro" value={form.bairro} readOnly />
          <input name="cidade" placeholder="Cidade" value={form.cidade} readOnly />
          <input name="uf" placeholder="UF" value={form.uf} readOnly />
          <input
            name="numero"
            placeholder="Número"
            value={form.numero}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" id="btn-salvar">
            {editIndex !== null ? "Atualizar" : "Salvar"}
          </button>

          <button
            type="button"
            id="btn-apagar"
            onClick={() =>
              setForm({
                nome: "",
                sobrenome: "",
                celular: "",
                cep: "",
                logradouro: "",
                bairro: "",
                cidade: "",
                uf: "",
                numero: "",
              })
            }
          >
            Limpar
          </button>
        </div>
      </form>

      <input
        id="filtro"
        placeholder="Filtrar por nome..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Nome Completo</th>
            <th>Celular</th>
            <th>Endereço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((cliente, index) => (
            <tr key={index}>
              <td>{cliente.nomeCompleto}</td>
              <td>{cliente.celular}</td>
              <td>{cliente.endereco}</td>
              <td>
                <button className="btn-editar" onClick={() => editarCliente(index)}>
                  ✏️ Editar
                </button>
                <button className="btn-remover" onClick={() => removerCliente(index)}>
                  ❌ Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p id="copy">&copy; FlavioNoim</p>
    </div>
  );
}