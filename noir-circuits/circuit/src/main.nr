global IMAGE_DIMENSION: u16 = 256;
global IMAGE_LENGTH: u16 = 768; //16 x 16 x 3

// It verifies that the gray_image is equal to grayscale of the orig_image
// @parma orig_image: the original image
// @param gray_image: the gray image
fn gray<N, M>(orig_image: [u32; N], gray_image: [u32; M]) {
    for i in 0..N {
        let orig_image_r = orig_image[i];
        let orig_image_g = orig_image[i + IMAGE_DIMENSION];
        let orig_image_b = orig_image[i + IMAGE_DIMENSION + IMAGE_DIMENSION];
        let mut gray_pixel_given = 100 * gray_image[i];
        let gray_pixel_calculated = (30 * orig_image_r) + (59 * orig_image_g) + (11 * orig_image_b);
        if gray_pixel_calculated > gray_pixel_given {
            assert(gray_pixel_calculated - gray_pixel_given < 100);
        } else {
            assert(gray_pixel_given - gray_pixel_calculated < 100);
        }
    }
}

fn main(orig_image: pub [u32; IMAGE_LENGTH], gray_image: pub [u32; IMAGE_DIMENSION]) {
    gray(orig_image, gray_image);
}

#[test]
fn test_gray_pass() {
    // let mut orig_image: [u32; IMAGE_LENGTH] = [(0, 0, 0); IMAGE_LENGTH];

    // orig_image = [150, 45, 150, 45, 150, 45, 93, 239, 93, 239, 200, 97, 200, 97, 200,97];

    // let mut gray_image = [0; IMAGE_LENGTH];
    // gray_image[0] = 122;
    // gray_image[1] = 165;
    // gray_image[2] = 122;
    // gray_image[3] = 165;
    // gray_image[4] = 122;
    // gray_image[5] = 165;

    // main(orig_image, gray_image);
}