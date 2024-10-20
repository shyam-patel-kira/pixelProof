pragma circom 2.0.0;

template GrayscaleChecker(n) {
    signal input orig[n][3];
    signal input gray[n];
    signal input negativeRemainder[n];    
    signal input positiveRemainder[n];
    signal output n_check;
 
    for (var i = 0; i < n; i++) {      
        assert(30 * orig[i][0] + 59 * orig[i][1] + 11 * orig[i][2] < 100 * gray[i] - negativeRemainder[i] + positiveRemainder[i]); 
    }
    
    n_check <== n;
}

// For 10x10 images
component main = GrayscaleChecker(200);

// For 20x20 images
// component main20x20 = GrayscaleChecker(400);