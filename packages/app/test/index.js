const { Application } = require('../');
const { autoDetectRenderer } = require('@pixi/canvas-renderer');
const { Container } = require('@pixi/display');
const { Ticker } = require('@pixi/ticker');
const { skipHello } = require('@pixi/utils');

skipHello();

// Use fallback if no webgl
Application.prototype.createRenderer = autoDetectRenderer;

describe('PIXI.Application', function ()
{
    it('should generate application', function (done)
    {
        expect(Application).to.be.a.function;
        const app = new Application();

        expect(app.stage).to.be.instanceof(Container);
        expect(app.ticker).to.be.instanceof(Ticker);
        expect(app.renderer).to.be.ok;

        app.ticker.addOnce(() =>
        {
            app.destroy();
            done();
        });
    });

    it('should remove canvas when destroyed', function (done)
    {
        const app = new Application();
        const view = app.view;

        expect(view).to.be.instanceof(HTMLCanvasElement);
        document.body.appendChild(view);

        app.ticker.addOnce(() =>
        {
            expect(document.body.contains(view)).to.be.true;
            app.destroy(true);
            expect(document.body.contains(view)).to.be.false;
            done();
        });
    });

    it('should not start application before calling start method if options.autoStart is false', function (done)
    {
        const app = new Application({ autoStart: false });

        expect(app.ticker.started).to.be.false;
        app.start();

        app.ticker.addOnce(() =>
        {
            app.destroy();
            done();
        });
    });

    describe('set ticker', function ()
    {
        before(function ()
        {
            this.app = new Application();
            /* remove default listener to prevent uncaught exception */
            this.app._ticker.remove(this.app.render, this.app);
        });

        after(function ()
        {
            this.app.destroy(true);
        });

        it('should assign ticker object', function ()
        {
            const ticker = { add: sinon.spy() };
            const _ticker = { remove: sinon.spy() };

            this.app._ticker = _ticker;
            this.app.ticker = ticker;

            expect(_ticker.remove).to.be.calledOnce;
            expect(_ticker.remove.args[0][0]).to.be.equal(this.app.render);
            expect(_ticker.remove.args[0][1]).to.be.equal(this.app);

            expect(this.app._ticker).to.be.equal(ticker);
            expect(ticker.add).to.be.calledOnce;
            expect(ticker.add.args[0][0]).to.be.equal(this.app.render);
            expect(ticker.add.args[0][1]).to.be.equal(this.app);
            expect(ticker.add.args[0][2]).to.be.equal(PIXI.UPDATE_PRIORITY.LOW);
        });

        it('should assign ticker if no ticker', function ()
        {
            const ticker = { add: sinon.spy() };

            this.app._ticker = null;
            this.app.ticker = ticker;

            expect(this.app._ticker).to.be.equal(ticker);
            expect(ticker.add).to.be.calledOnce;
            expect(ticker.add.args[0][0]).to.be.equal(this.app.render);
            expect(ticker.add.args[0][1]).to.be.equal(this.app);
            expect(ticker.add.args[0][2]).to.be.equal(PIXI.UPDATE_PRIORITY.LOW);
        });

        it('should assign null ticker', function ()
        {
            const _ticker = { remove: sinon.spy() };

            this.app._ticker = _ticker;
            this.app.ticker = null;

            expect(_ticker.remove).to.be.calledOnce;
            expect(_ticker.remove.args[0][0]).to.be.equal(this.app.render);
            expect(_ticker.remove.args[0][1]).to.be.equal(this.app);

            expect(this.app._ticker).to.be.null;
        });
    });
});