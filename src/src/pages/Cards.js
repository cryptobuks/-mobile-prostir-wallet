var Conf = require('../config/Config.js');
var Navbar = require('../components/Navbar.js');
var Footer = require('../components/Footer.js');
var Auth = require('../models/Auth.js');

var Cards = module.exports = {

        controller: function () {
            var ctrl = this;

            var needle_asset = 'EUAH'; //TODO change to multi-asset operations, when time is come

            this.keypair = m.prop(false);
            this.balances = m.prop([]);
            this.needle_balance = m.prop([]);
            this.card_balance = m.prop([]);
            this.card_balances_sum = m.prop(0);
            this.assets = m.prop([]);

            if (!Auth.keypair()) {
                return m.route('/');
            }
            this.seed = m.prop(m.route.param('seed') ? m.route.param('seed') : '');

            this.updateCardBalances = (accountId) => {
                return Auth.loadAccountById(accountId)
                    .then(source => {

                        var response = source.balances;

                        var assets = [];
                        var balances = [];
                        var sum = 0;

                        Object.keys(response).map(index => {
                            if (response[index].asset_type != 'native') {
                                balances.push({
                                    balance: response[index].balance,
                                    asset: response[index].asset_code
                                });
                                sum += response[index].balance;
                                if (response[index].asset_code === needle_asset) {
                                    ctrl.card_balance(parseFloat(response[index].balance).toFixed(2));
                                    ctrl.needle_balance(ctrl.card_balance());
                                }
                                assets.push({
                                    asset: response[index].asset_code
                                });
                            }
                        });
                        m.startComputation();
                        ctrl.balances(balances);
                        ctrl.assets(assets);
                        ctrl.card_balances_sum(sum * 100); //we need sum in coins for calculations
                        m.endComputation();
                    });
            };

            if (this.seed().length == 56) {
                this.keypair(StellarSdk.Keypair.fromSeed(this.seed()));
                this.updateCardBalances(this.keypair().accountId());
            }

            this.processTransfer = (e) => {
                e.preventDefault();
                var amount = parseFloat(ctrl.needle_balance()).toFixed(2);
                if (parseFloat(amount) > parseFloat(ctrl.card_balance())) {
                    return m.flashError(Conf.tr("Card has no enough money in this asset!"));
                }
                //m.startComputation();
                m.onLoadingStart();
                Conf.horizon.loadAccount(ctrl.keypair().accountId())
                    .then(source => {
                        var memo = StellarSdk.Memo.text("funding_card");
                        var tx = new StellarSdk.TransactionBuilder(source, {memo: memo})
                            .addOperation(StellarSdk.Operation.payment({
                                destination: Auth.keypair().accountId(),
                                amount: amount,
                                asset: new StellarSdk.Asset(e.target.asset.value, Conf.master_key)
                            }))
                            .build();
                        tx.sign(ctrl.keypair());

                        return Conf.horizon.submitTransaction(tx);
                    })
                    .then(() => {
                        m.flashSuccess(Conf.tr("Funding successful"));
                        return ctrl.updateCardBalances(ctrl.keypair().accountId()).bind(ctrl);
                    })
                    .catch(err => {
                        console.log(err);
                        m.flashError(Conf.tr("Can't make funding"));
                    })
            }

        },

        view: function (ctrl) {
            return [m.component(Navbar),
                <div class="wrapper">
                    <div class="container">
                        <h2>{Conf.tr("Card")}</h2>
                        <div class="row">
                            <form class="col-sm-4" onsubmit={ctrl.processTransfer.bind(ctrl)}>
                                <div class="panel panel-primary">
                                    <div class="panel-heading">{Conf.tr("Scratch card")}</div>
                                    <div class="panel-body">
                                        <table class="table m-b-30">
                                            {Auth.balances().length ?
                                                <tr>
                                                    <td><b>{Conf.tr("Your balance")}:</b></td>
                                                    <td>
                                                        <b>
                                                            {Auth.balances().map(b => {
                                                                return parseFloat(b.balance).toFixed(2) + " " + b.asset
                                                            })}
                                                        </b>
                                                    </td>
                                                </tr>
                                                :
                                                ''
                                            }
                                            <tr>
                                                <td>{Conf.tr("Card balance")}:</td>
                                                <td>
                                                    {ctrl.balances().map(b => {
                                                        return parseFloat(b.balance).toFixed(2) + " " + b.asset
                                                    })}
                                                </td>
                                            </tr>
                                        </table>
                                        {( ctrl.balances().length && ctrl.card_balances_sum() > 0 ) ?
                                            <div>
                                                <div class="form-group">
                                                    <label for="money_to_get">
                                                        {Conf.tr("How much do you want to redeem?")}
                                                    </label>
                                                    <input type="number" name="money_to_get" id="money_to_get"
                                                           min="0.01" step="0.01" max={ctrl.card_balance()}
                                                           value={ctrl.needle_balance()}
                                                           oninput={m.withAttr('value', ctrl.needle_balance)}
                                                           required="required" class="form-control"/>
                                                </div>
                                                <div class="form-group">
                                                    <label>{Conf.tr("Asset")}</label>
                                                    <select name="asset" required="required" class="form-control">
                                                        {ctrl.assets().map(b => {
                                                            return <option value={b.asset}>{b.asset}</option>
                                                        })}
                                                    </select>
                                                </div>
                                                <div class="form-group">
                                                    <button class="btn btn-primary">{Conf.tr("Get money")}</button>
                                                </div>

                                            </div>
                                            :
                                            <div>
                                                <div class="form-group">
                                                    <label>{Conf.tr("This card is already used")}</label>
                                                </div>
                                            </div>
                                        }

                                    </div>

                                </div>

                                <div class="clearfix"></div>
                            </form>
                        </div>

                    </div>
                </div>
                ,
                m.component(Footer)
            ]
                ;
        }

    }
    ;