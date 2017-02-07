// TypeScript file
var TestCmd = (function (_super) {
    __extends(TestCmd, _super);
    function TestCmd() {
        _super.apply(this, arguments);
    }
    var d = __define,c=TestCmd,p=c.prototype;
    p.execute = function () {
        // let generator = new FightProcessGenerator();
        // generator.addConfigDataArr(fight.TEST_ROLE);
        // let clientSteps = generator.generateData(fight.TEST_BUNCH);
        // let serverSteps = this.data.battleReport;
        // if (fight.check(clientSteps, serverSteps)) {
        //     TestCmd.count++;
        //     console.log("测试ok", TestCmd.count);
        //     fight.randomReq();
        // } else {
        //     console.log("测试失败", TestCmd.count);
        // }
    };
    TestCmd.count = 0;
    return TestCmd;
}(BaseCmd));
egret.registerClass(TestCmd,'TestCmd');
//# sourceMappingURL=TestCmd.js.map