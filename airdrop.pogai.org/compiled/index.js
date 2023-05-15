import LottiePlayer from "lottie-web";
import Lottie from "./components/Lottie";
import useLottie from "./hooks/useLottie";
import useLottieInteractivity from "./hooks/useLottieInteractivity";
// TODO: For backward compatibility, remove on v2
export const Animator = Lottie;
export const useAnimator = useLottie;
export {
    LottiePlayer,
    useLottie,
    useLottieInteractivity
};
export default Lottie;
export * from "./types";