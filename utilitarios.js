//importando modulos 
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const index = require('./index');

function opcoesSenhaErro() {
    console.log('================================================');
    inquirer.prompt([
        {
            type: 'list',
            name: 'erroSenha',
            message: 'O que você deseja fazer?',
            choices: [
                'Tentar novamente',
                'Voltar ao menu principal',
                'Sair',
            ],
        },
    ])
    .then((answer) => {
        const erroSenha = answer['erroSenha'];

        if (erroSenha === 'Tentar novamente') {
            return index.abrirConta();
        } else if (erroSenha === 'Voltar ao menu principal') {
            index.menu();
        } else if (erroSenha === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
            process.exit();
        }
    });
};

function checarConta(nomeConta) {
    if (!fs.existsSync(`contas/${nomeConta}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe, Crie uma conta para continuar!'));
        return false;
    }
    return true;
}

function buscarContaJson(nomeConta) {
    const contaJson = fs.readFileSync(`contas/${nomeConta}.json`, {
        encoding: 'utf-8',
        flag: 'r',
    })
    return JSON.parse(contaJson);
}

function verificarSenha(nomeConta, senha) {
    
    const contaDados = buscarContaJson(nomeConta);    

    if(contaDados.senha !== senha) {
        return false;
    } else {
        return true;
    };
};

function adicionarValor(nomeConta, valor) {
    const contaDados = buscarContaJson(nomeConta);

    if(!valor) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
        return index.deposito()
    };

    contaDados.balance = parseFloat(valor) + parseFloat(contaDados.balance);

    fs.writeFileSync(`contas/${nomeConta}.json`, JSON.stringify(contaDados), function (err) {
        console.log(err);
    });

    console.log(chalk.green(`Foi depositado o valor de R$${valor} na sua conta!`));
};

function removerValor(nomeConta, valor) {
    const contaDados = buscarContaJson(nomeConta);

    if (!valor) {
        console.log(chalk.bgRed.black('Não foi definido um valor para ser retirado!'));
        return index.sacar();
    };

    if (contaDados.balance < valor) {
        console.log(chalk.bgRed.black('Valor indisponível!'));
        return index.sacar();
    };

    contaDados.balance = parseFloat(contaDados.balance) - parseFloat(valor);

    fs.writeFileSync(`contas/${nomeConta}.json`, JSON.stringify(contaDados), function (err) {
        console.log(err);
    });

    console.log(chalk.green(`Foi realizado um saque de R$${valor} da sua conta!`));
};

module.exports = {
    opcoesSenhaErro, 
    checarConta, 
    buscarContaJson,
    verificarSenha,
    adicionarValor, 
    removerValor,   
};