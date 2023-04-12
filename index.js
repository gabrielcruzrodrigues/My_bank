//importando modulos 
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const utilitarios = require('./utilitarios');
const { EventEmitter } = require('events');

EventEmitter.defaultMaxListeners = 16;

menu();

//menu inicial
function menu() {
    console.log('================================================');

    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Sacar',
                'Deletar Conta',
                'Sair',
            ],
        },
    ])
    .then((answer) => {
        const action = answer['action'];
        
        if (action == 'Criar conta') {
                criarConta();
            } else if (action === 'Depositar') {
                deposito();
            } else if (action === 'Consultar saldo') {
                consultarSaldo();
            } else if (action === 'Sacar') {
                sacar();
            } else if (action === 'Deletar Conta') {    
                deletarConta();
            } else if (action === 'Sair') {
                console.log(chalk.bgBlue.black('Obrigado por usar Nosso banco!'));
                process.exit();
            }
        });
}

//criando nova conta
function criarConta() {
    console.log('================================================');
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'));
    console.log(chalk.green('Defina as opções da sua conta a seguir'));

    abrirConta();
};

function abrirConta() {
    console.log('================================================');
    inquirer.prompt([
        {
            name: 'nomeConta',
            message: 'Digite um nome para a sua conta:',
        },
    ])
    .then((answer) => {
        console.log('================================================');
        const nomeConta = answer['nomeConta'];

        //verifica se a pasta contas existe, se não existir, sera criada;
        if(!fs.existsSync('contas')) {
            fs.mkdirSync('contas');
        }

        //verifica se o nome do usuario esta em branco
        if (nomeConta === '') {
            console.log(chalk.bgRed.black("O seu nome não pode ser ' ', escolha outro nome"));
            return abrirConta();
        }

        //verifica se o nome do usuario é uma string e nao é um numero
        if (typeof nomeConta !== 'string' || !/^[a-zA-Z]+$/.test(nomeConta)) {
            console.log(chalk.bgRed.black('O nome da sua conta deve ter apenas Letras!'));
            return abrirConta();
        }

        //verifica se o usuario já existe detro da pasta contas;
        if (fs.existsSync(`contas/${nomeConta}.json`)) {
            console.log(chalk.bgRed.black('Esta conta ja existe, escolha outro nome!'));

            console.log('================================================');
            //opções para caso a conta ja exista
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'novoNome',
                    message: 'O que você deseja fazer?',
                    choices: [
                        'Escolher um novo nome para a sua conta',
                        'Voltar ao menu principal',
                        'Sair',
                    ],
                },
            ])
            .then((answer) => {
                const rename = answer['novoNome'];

                if (rename === 'Escolher um novo nome para a sua conta') {
                    abrirConta();
                } else if (rename === 'Voltar ao menu principal') {
                    menu();
                } else if (rename === 'Sair') {
                    console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                    process.exit();
                }
            })
        } else {

            inquirer.prompt([
                {
                    name: 'senha',
                    message: 'Digite uma senha (apenas com numeros) para a sua conta:'
                }
            ])
            .then((answer) => {
                const senha = answer['senha'];

                //filtro para a senha ter mais de cinco digitos
                if (senha.length < 5) {
                    console.log(chalk.bgRed.black('A sua senha deve conter mais de cinco carateres'));
                    return utilitarios.opcoesSenhaErro();
                }
                
                //Filtrando a senha
                if (typeof senha !== 'string' || !/^[0-9]+$/.test(senha)) {
                    console.log(chalk.bgRed.black('Sua senha deve conter apenas numeros!'));

                    //opções caso a senha não seja apenas numerica
                    utilitarios.opcoesSenhaErro();

                } else {

                    //Criando o arquivo com o nome do usuario e senha
                    fs.writeFileSync(`contas/${nomeConta}.json`, `{"balance":0, "senha":${senha}}`, function (err) {
                    console.log(err);

                    });
    
                    console.log(chalk.green(`Obrigado! Sua conta {${nomeConta}} acabou de ser criada!`));
                    menu();
                }
            })       
        }
    });
};

function consultarSaldo() {
    console.log('================================================');
    inquirer.prompt([
        {
            name: 'nomeConta',
            message: 'Qual o nome da sua conta?',
        }
    ])
    .then((answer) => {
        const nomeConta = answer['nomeConta'];

        if (!utilitarios.checarConta(nomeConta)) {
            console.log('================================================');
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'novoNome',
                    message: 'O que você deseja fazer?',
                    choices: [
                        'Escolher um nome para a sua nova conta',
                        'Voltar ao menu principal',
                        'Sair',
                    ],
                },
            ])
            .then((answer) => {
                const rename = answer['novoNome'];

                if (rename === 'Escolher um nome para a sua nova conta') {
                    abrirConta();
                } else if (rename === 'Voltar ao menu principal') {
                    menu();
                } else if (rename === 'Sair') {
                    console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                    process.exit();
                }
            })
        } else {

            inquirer.prompt([
                {
                    name: 'senha',
                    message: 'Digite a sua senha:',
                }
            ])
            .then((answer) => {
                const senha = Number(answer['senha']);
                const contaDados = utilitarios.buscarContaJson(nomeConta);

                if(!utilitarios.verificarSenha(nomeConta, senha)) {
                    console.log(chalk.bgRed.black('Senha incorreta, tente novamente!'));
                    consultarSaldo();
                } else {
                    console.log(chalk.bgBlue(`O saldo da sua conta é de R$${contaDados.balance}`));

                    menu();
                }
            })
        };
    });
};

function deposito() {
    console.log('================================================');
    inquirer.prompt([
        {
            name: 'nodeConta',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer) => {
        const nomeConta = answer['nodeConta'];

        if (!utilitarios.checarConta(nomeConta)) {
            console.log('================================================');
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'novoNome',
                    message: 'O que você deseja fazer?',
                    choices: [
                        'Escolher um nome para a sua nova conta',
                        'Voltar ao menu principal',
                        'Sair',
                    ],
                },
            ])
            .then((answer) => {
                const rename = answer['novoNome'];

                if (rename === 'Escolher um nome para a sua nova conta') {
                    abrirConta();
                } else if (rename === 'Voltar ao menu principal') {
                    menu();
                } else if (rename === 'Sair') {
                    console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                    process.exit();
                }
            })
        } else {

            inquirer.prompt([
                {
                    name: 'senha',
                    message: 'Digite a sua senha:',
                }
            ])
            .then((answer) => {
                const senha = Number(answer['senha']);
                const contaDados = utilitarios.buscarContaJson(nomeConta);

                if(!utilitarios.verificarSenha(nomeConta, senha)) {
                    console.log(chalk.bgRed.black('Senha incorreta, tente novamente!'));
                    consultarSaldo();
                } else {
                    console.log('================================================');
                        inquirer.prompt([
                            {
                                name: 'valor',
                                message: 'Quanto você deseja depositar? R$',
                            },
                        ])
                        .then((answer) => {
                            const valor = answer['valor'];

                            utilitarios.adicionarValor(nomeConta, valor);
                            menu();
                        })
                }
            });
        };
    });
}  

function sacar() {
    console.log('================================================');
    inquirer.prompt([
        {
            name: 'nomeConta',
            message: 'Qual o nome da sua conta?',
        }
    ])
    .then((answer) => {
        const nomeConta = answer['nomeConta'];

        if (!utilitarios.checarConta(nomeConta)) {
            console.log('================================================');

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'novoNome',
                    message: 'O que você deseja fazer?',
                    choices: [
                        'Escolher um nome para a sua nova conta',
                        'Voltar ao menu principal',
                        'Sair',
                    ],
                }
            ])
            .then((answer) => {
                const rename = answer['novoNome'];

                if (rename === 'Escolher um nome para a sua nova conta') {
                    abrirConta();
                } else if (rename === 'Voltar ao menu principal') {
                    menu();
                } else if (rename === 'Sair') {
                    console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                    process.exit();
                }
            })
        } else {
            inquirer.prompt([
                {
                    name: 'senha',
                    message: 'Digite a sua senha:',
                }
            ])
            .then((answer) => {
                const senha = Number(answer['senha']);
                const contaDados = utilitarios.buscarContaJson(nomeConta);

                if (!utilitarios.verificarSenha(nomeConta, senha)) {
                    console.log(chalk.bgRed.black('Senha incorreta, tente novamente!'));
                    sacar();
                } else {
                    console.log('================================================');
                    inquirer.prompt([
                        {
                            name: 'valor',
                            message: 'Quanto voçê deseja sacar? R$',
                        },
                    ])
                    .then((answer) => {
                        const valor = answer['valor'];

                        utilitarios.removerValor(nomeConta, valor);
                        menu();
                    })
                }
            })
        }
    })
}

function deletarConta() {
    console.log('================================================');

    inquirer.prompt([
        {
            name: 'nomeConta',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer) => {
        const nomeConta = answer['nomeConta'];

        //conferindo se a conta existe
        if(!utilitarios.checarConta(nomeConta)) {
            console.log('================================================');
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'novoNome',
                    message: 'O que você deseja fazer?',
                    choices: [
                        'Escolher um novo nome para a sua conta',
                        'Voltar ao menu principal',
                        'Sair',
                    ],
                },
            ])
            .then((answer) => {
                const rename = answer['novoNome'];

                if (rename === 'Escolher um novo nome para a sua conta') {
                    abrirConta();
                } else if (rename === 'Voltar ao menu principal') {
                    menu();
                } else if (rename === 'Sair') {
                    console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                    process.exit();
                };
            });
        } else {
            inquirer.prompt([
                {
                    name: 'senha',
                    message: 'Digite a sua senha',
                }
            ])
            .then((answer) => {
                const senha = Number(answer['senha']);
                const contaDados = utilitarios.buscarContaJson(nomeConta);

                if (!utilitarios.verificarSenha(nomeConta, senha)) {
                    console.log(chalk.bgRed.black('Senha incorreta, tente novamente!'));
                    deletarConta();
                } else {
                    console.log(chalk.bgBlue.black(`A conta {${nomeConta}} foi selecionada!`));

                    inquirer.prompt([
                        {
                            name: 'deletar',
                            message: 'Tem certeza? sim = s / não = n  :',
                        }
                    ])
                    .then((answer) => {
                        const deletar = answer['deletar'];

                        //verificando se a resposta foi algo diferente de s ou n
                        if(deletar !== 's' && deletar !== 'n') {
                            console.log(chalk.bgRed.black('Digite uma opção valida!'));
                            menu();
                        }

                        if(deletar === 'n') {
                            console.log(chalk.bgGreen.black('Obrigado por continuar conosco!'));
                        }

                        //deletando o arquivo da pasta contas
                        if (deletar === 's') {
                            console.log(chalk.bgRed.black('sua conta foi deletada!'));
                            fs.unlink(`contas/${nomeConta}.json`, function (err) {
                                if (err) throw err;
                            });
                        }

                        menu();
                    })
                };
            });
        };
    });
};

module.exports = {
    menu, 
    abrirConta,
    deposito,
    sacar,
};