var _ = require('lodash');

/**
 * Takes the data set and splits it in half for a 5 / 2 test.
 * @param t
 */
function splitData(t) {
    var dataSet1 = [], dataSet2 = [];
    var half = t.length / 2;
    var tClone = _.clone(t);

    while (tClone.length) {
        var a = Math.floor(Math.random() * 100) % 2 === 0;
        var input = tClone.shift();
        var output = tClone.shift();

        if (a && dataSet1.length < half) {
            dataSet1.push(input);
            dataSet1.push(output);
        } else if (a) {
            dataSet2.push(input);
            dataSet2.push(output);
        }

        if (!a && dataSet2.length < half) {
            dataSet2.push(input);
            dataSet2.push(output);
        } else if (!a) {
            dataSet1.push(input);
            dataSet1.push(output);
        }
    }

    return [dataSet1, dataSet2];
}



/**
 * @param {NeuralNetwork} network
 * @param {Array.<Number[]>} t
 */
function trainData(network, t) {
    for (var i = 0; i < t.length; i += 2) {
        var input = t[i];
        var expectedOutput = t[i + 1];

        network.train(input, expectedOutput);
    }
}

/**
 * Runs a random data point through the network with its
 * expected output
 * @name trainOnce
 * @param {NeuralNetwork} network
 * @param {Array.<Number[]>} t
 */
function trainOnce(network, t) {
    var i = Math.floor(Math.random() * t.length);

    if (i % 2 !== 0) {
        i--;
    }

    network.train(t[i], t[i + 1]);
}

/**
 * @name NetworkTrainer
 * @param {NeuralNetwork} network
 * @param {Array.<Number[]>} t
 * @param {Number} n
 */
function train(network, t, n) {
    for (var trains = 0; trains < n; trains++) {
        trainData(network, t);
    }
}

/**
 * Will perform a test and calculate the average error from perspective of to - ao
 * @param {NeuralNetwork} network
 * @param {Array.<Number[]>} t
 * @returns {Array.<Array.<Number[]>>} t
 */
function testData(network, t) {
    var tOut = [];
    var tExp = [];
    var tErr = [];

    for (var i = 0; i < t.length; i += 2) {
        var input = t[i];
        var expectedOutput = t[i + 1];

        var output = network.test(input);
        var outputs = [];
        var errors = [];
        var exp = [];
        for (var o = 0; o < output.length; o++) {
            outputs.push(output[o]);
            errors.push(output[o] - expectedOutput[o]);
            exp.push(expectedOutput[o]);
        }

        tOut.push(outputs);
        tErr.push(errors);
        tExp.push(exp);
    }

    return [tOut, tExp, tErr];
}

/**
 * Gets the training stats from the training data.
 * @param trainingData
 * @returns {Number[]} Accuracy, Error, Count  These are non averaged values
 */
function getStats(trainingData) {
    var tOut = trainingData[0];
    var tExp = trainingData[1];
    var tErr = trainingData[2];
    var accuracy = 0;
    var error = 0;

    // tOut, tExp, and tErr should all be the same length
    for (var i = 0; i < tOut.length; i++) {
        var outs = tOut[i];
        var exps = tExp[i];
        var errors = tErr[i];

        // The sub tests for each outs, exps, and errors should all be the same length
        for (var j = 0; j < outs.length; j++) {

            // NOTE: I know that there will only be one output
            accuracy += outs[j] / exps[j];
            errors += errors[j];
        }
    }

    return [accuracy, error, i];
}

var NetworkExperiments = {

    /**
     * @param {NeuralNetwork} network
     * @param {Array.<Number[]>} t
     * @return {Number[]} avg accuracy, avg error, test input count
     */
    five2Training: function(network, t) {
        var accuracy = 0;
        var error = 0;
        var tests = 0;

        for (var i = 0; i < 5; i++) {

            var datasets = splitData(t);

            network.reset();
            trainData(network, datasets[0]);
            var stats1 = getStats(testData(network, datasets[1]));

            network.reset();
            trainData(network, datasets[1]);
            var stats2 = getStats(testData(network, datasets[0]));

            accuracy += stats1[0] + stats2[0];
            error += stats1[1] + stats2[1];
            tests += stats1[2] + stats2[2];
        }
        network.reset();

        // Returns the average accuracy, error, and the count of test points that
        // were tested
        return [accuracy / tests, error / tests, tests];
    },

    /**
     * @type trainOnce
     */
    trainOnce: trainOnce,

    /**
     * @type NetworkTrainer
     */
    train: train
};

module.exports = NetworkExperiments;