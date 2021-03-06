const TokenBase = artifacts.require('ERC20Base');
const Token = artifacts.require('Token');

contract('ERC20 Base', (accounts) => {
    let token;
    const tokenName = "Delta Coin";
    const tokenSymbol = "DTC";
    const tokenDecimals = "18";
    const tokenTotalSupply = new web3.BigNumber('272e+26');
    const owner = accounts[0];
    const recipient = accounts[1];
    const allowedAccount = accounts[2];
    const ownerSupply = new web3.BigNumber('272e+26');

    // To send the right amount of tokens, taking in account number of decimals.
    const decimalsMul = new web3.BigNumber('1e+18');
    const burnTotal = new web3.BigNumber('1e+18');

    beforeEach(async () => {
        token = await TokenBase.new(owner);
    });

    it('has correct totalSupply after construction', async () => {
        const actualSupply = await token.totalSupply();
        assert.equal(actualSupply.toString(), tokenTotalSupply.toString());
    });

    it('has correct token name after construction', async () => {
        const actualName = await token.name();
        assert.equal(actualName, tokenName);
    });

    it('has correct token symbol after construction', async () => {
        const actualSymbol = await token.symbol();
        assert.equal(actualSymbol, tokenSymbol);
    });

    it('has correct token decimals after construction', async () => {
        const actualDecimals = await token.decimals();
        assert.equal(actualDecimals.toString(), tokenDecimals);
    });

    it('has correct owner token balance after construction', async () => {
        const actualBalance = await token.balanceOf(owner);
        console.log(actualBalance);
        assert.equal(actualBalance.toString(), ownerSupply.toString());
    });

    it('emits Transfer event on transfer', async () => {
        const tokenAmount = decimalsMul.mul(100);
        console.log(tokenAmount);
        const { logs } = await token.transfer(recipient, tokenAmount);
        console.log(logs);
        const event = logs.find(e => e.event === 'Transfer');
        assert.notEqual(event, undefined);
    });

    it('recipient and sender have correct balances after transfer', async () => {
        const tokenAmount = decimalsMul.mul(100);
        await token.transfer(recipient, tokenAmount);
        const actualSenderBalance = await token.balanceOf(owner);
        const actualRecipientBalance = await token.balanceOf(recipient);
        assert.equal(actualSenderBalance.toString(), ownerSupply.minus(tokenAmount).toString());
        assert.equal(actualRecipientBalance.toString(), tokenAmount.toString());
    });

    it('throws when trying to transfer more than available balance', async () => {
        const moreThanBalance = tokenTotalSupply.plus(1);
        await token.transfer(recipient, moreThanBalance).then(() => {
            assert(false, "more than available balance.");
        }, () => { });
    });

    it('returns the correct allowance amount after approval', async () => {
        const tokenAmount = decimalsMul.mul(100);
        await token.approve(recipient, tokenAmount);
        const actualAllowance = await token.allowance(owner, recipient);
        assert.equal(actualAllowance.toString(), tokenAmount.toString());
    });

    it('emits Approval event after approval', async () => {
        const tokenAmount = decimalsMul.mul(100);
        const { logs } = await token.approve(recipient, tokenAmount);
        const event = logs.find(e => e.event === 'Approval');
        assert.notEqual(event, undefined);
    });

    it('successfully resets allowance', async () => {
        const tokenAmount = decimalsMul.mul(100);
        const newTokenAmount = decimalsMul.mul(50);
        await token.approve(recipient, tokenAmount);
        await token.approve(recipient, 0);
        await token.approve(recipient, newTokenAmount);
        const actualAllowance = await token.allowance(owner, recipient);
        assert.equal(actualAllowance.toString(), newTokenAmount.toString());
    });

    it('returns correct balances after transfering from another account', async () => {
        const tokenAmount = decimalsMul.mul(100);
        await token.approve(allowedAccount, tokenAmount);
        await token.transferFrom(owner, recipient, tokenAmount, { from: allowedAccount });
        const balanceOwner = await token.balanceOf(owner);
        const balanceRecipient = await token.balanceOf(recipient);
        const balanceAllowedAcc = await token.balanceOf(allowedAccount);
        assert.equal(balanceOwner.toString(), ownerSupply.minus(tokenAmount).toString());
        assert.equal(balanceAllowedAcc.toNumber(), 0);
        assert.equal(balanceRecipient.toNumber(), tokenAmount.toString());
    });

    it('emits Transfer event on transferFrom', async () => {
        const tokenAmount = decimalsMul.mul(100);
        await token.approve(allowedAccount, tokenAmount);
        const { logs } = await token.transferFrom(owner, recipient, tokenAmount,
            { from: allowedAccount });
        const event = logs.find(e => e.event === 'Transfer');
        assert.notEqual(event, undefined);
    });

    it('throws when trying to transferFrom more than allowed amount', async () => {
        const tokenAmountAllowed = decimalsMul.mul(99);
        const tokenAmount = decimalsMul.mul(100);
        await token.approve(allowedAccount, tokenAmountAllowed);
        await token.transferFrom(owner, recipient, tokenAmount, { from: accounts[1] }).then(() => {
            assert(false, "more than allowed amount.");
        }, () => { });
    });

    it('throws an error when trying to transferFrom more than _from has', async () => {
        await token.approve(allowedAccount, ownerSupply.plus(1));
        await token.transferFrom(owner, recipient, ownerSupply.plus(1),
            { from: allowedAccount }).then(() => {
                assert(false, " more than _from has.");
            }, () => { });
    });

    it('should burn token success', async () => {
        await token.burn(burnTotal);
        const remaining = await token.totalSupply();
        assert.equal(tokenTotalSupply - burnTotal, remaining);
    })

    it('failed if not enough balance', async () => {
        await token.burn(burnTotal, { from: recipient }).then(() => {
            assert(false, "not enough token.");
        }, () => { });;
    })
});

contract('Token', (accounts) => {
    const owner = "0x0A6065569370BF9Ee13c3A0da1cf6201B1870576".toLocaleLowerCase();

    beforeEach(async () => {
        token = await Token.new();
    });

    it('should target owner', async () => {
        actualOwner = await token.owner();
        assert.equal(actualOwner, owner);
    })
})