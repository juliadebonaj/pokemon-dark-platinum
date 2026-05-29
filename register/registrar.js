const formRegistro = document.getElementById('form-registro');
const btnEnviar = document.getElementById('btn-enviar');
const inputNome = document.getElementById('nome');
const inputIdade = document.getElementById('idade');

function validarFormulario() {
    const nomeOk = inputNome.value.trim() !== '';
    const idadeOk = inputIdade.value.trim() !== '' && Number(inputIdade.value) > 0;
    btnEnviar.disabled = !(nomeOk && idadeOk);
}

inputNome.addEventListener('input', validarFormulario);
inputIdade.addEventListener('input', validarFormulario);

formRegistro.addEventListener('submit', async (event) => {

    event.preventDefault();

    const nomeTreinador = document.getElementById('nome').value;
    const idadeTreinador = document.getElementById('idade').value;

    const spriteSelecionado = document.querySelector('input[name="sprite"]:checked').value;

    const dadosUsuario = {
        nome: nomeTreinador,
        idade: idadeTreinador,
        avatar: spriteSelecionado
    };


    localStorage.setItem('treinador', JSON.stringify(dadosUsuario));
    localStorage.removeItem('equipe');

    await mostrarAlerta('Treinador registrado com sucesso!', 'Sucesso');

    formRegistro.reset();

    window.location.href = "../pokeTeam/equipe.html";


});
