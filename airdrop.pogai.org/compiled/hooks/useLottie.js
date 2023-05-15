import React, {
    useEffect,
    useRef,
    useState,
} from "react";
import lottie from "lottie-web";
const useLottie = (props, style) => {
    const {
        animationData,
        loop,
        autoplay,
        initialSegment,
        onComplete,
        onLoopComplete,
        onEnterFrame,
        onSegmentStart,
        onConfigReady,
        onDataReady,
        onDataFailed,
        onLoadedImages,
        onDOMLoaded,
        onDestroy,
        // Specified here to take them out from the 'rest'
        lottieRef,
        renderer,
        name,
        assetsPath,
        rendererSettings,
        // TODO: find a better way to extract the html props to avoid specifying
        //  all the props that we want to exclude (as you can see above)
        ...rest
    } = props;
    const [animationLoaded, setAnimationLoaded] = useState(false);
    const animationInstanceRef = useRef();
    const animationContainer = useRef(null);
    /*
          ======================================
              INTERACTION METHODS
          ======================================
       */
    /**
     * Play
     */
    const play = () => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.play();
    };
    /**
     * Stop
     */
    const stop = () => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.stop();
    };
    /**
     * Pause
     */
    const pause = () => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.pause();
    };
    /**
     * Set animation speed
     * @param speed
     */
    const setSpeed = (speed) => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setSpeed(speed);
    };
    /**
     * Got to frame and play
     * @param value
     * @param isFrame
     */
    const goToAndPlay = (value, isFrame) => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.goToAndPlay(value, isFrame);
    };
    /**
     * Got to frame and stop
     * @param value
     * @param isFrame
     */
    const goToAndStop = (value, isFrame) => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.goToAndStop(value, isFrame);
    };
    /**
     * Set animation direction
     * @param direction
     */
    const setDirection = (direction) => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setDirection(direction);
    };
    /**
     * Play animation segments
     * @param segments
     * @param forceFlag
     */
    const playSegments = (segments, forceFlag) => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.playSegments(segments, forceFlag);
    };
    /**
     * Set sub frames
     * @param useSubFrames
     */
    const setSubframe = (useSubFrames) => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setSubframe(useSubFrames);
    };
    /**
     * Get animation duration
     * @param inFrames
     */
    const getDuration = (inFrames) => {
        var _a;
        return (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.getDuration(inFrames);
    };
    /**
     * Destroy animation
     */
    const destroy = () => {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
    };
    /*
          ======================================
              LOTTIE
          ======================================
       */
    /**
     * Load a new animation, and if it's the case, destroy the previous one
     * @param {Object} forcedConfigs
     */
    const loadAnimation = (forcedConfigs = {}) => {
        var _a;
        // Return if the container ref is null
        if (!animationContainer.current) {
            return;
        }
        // Destroy any previous instance
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
        // Build the animation configuration
        const config = {
            ...props,
            ...forcedConfigs,
            container: animationContainer.current,
        };
        // Save the animation instance
        animationInstanceRef.current = lottie.loadAnimation(config);
        setAnimationLoaded(!!animationInstanceRef.current);
    };
    /**
     * Initialize and listen for changes that need to reinitialize Lottie
     */
    useEffect(() => {
        loadAnimation();
    }, [animationData, loop, autoplay, initialSegment]);
    /*
          ======================================
              EVENTS
          ======================================
       */
    /**
     * Reinitialize listener on change
     */
    useEffect(() => {
        const partialListeners = [{
                name: "complete",
                handler: onComplete
            },
            {
                name: "loopComplete",
                handler: onLoopComplete
            },
            {
                name: "enterFrame",
                handler: onEnterFrame
            },
            {
                name: "segmentStart",
                handler: onSegmentStart
            },
            {
                name: "config_ready",
                handler: onConfigReady
            },
            {
                name: "data_ready",
                handler: onDataReady
            },
            {
                name: "data_failed",
                handler: onDataFailed
            },
            {
                name: "loaded_images",
                handler: onLoadedImages
            },
            {
                name: "DOMLoaded",
                handler: onDOMLoaded
            },
            {
                name: "destroy",
                handler: onDestroy
            },
        ];
        const listeners = partialListeners.filter((listener) => listener.handler != null);
        if (!listeners.length) {
            return;
        }
        const deregisterList = listeners.map(
            /**
             * Handle the process of adding an event listener
             * @param {Listener} listener
             * @return {Function} Function that deregister the listener
             */
            (listener) => {
                var _a;
                (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener(listener.name, listener.handler);
                // Return a function to deregister this listener
                return () => {
                    var _a;
                    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener(listener.name, listener.handler);
                };
            });
        // Deregister listeners on unmount
        return () => {
            deregisterList.forEach((deregister) => deregister());
        };
    }, [
        onComplete,
        onLoopComplete,
        onEnterFrame,
        onSegmentStart,
        onConfigReady,
        onDataReady,
        onDataFailed,
        onLoadedImages,
        onDOMLoaded,
        onDestroy,
    ]);
    /**
     * Build the animation view
     */
    const View = React.createElement("div", Object.assign({
        style: style,
        ref: animationContainer
    }, rest));
    return {
        View,
        play,
        stop,
        pause,
        setSpeed,
        goToAndStop,
        goToAndPlay,
        setDirection,
        playSegments,
        setSubframe,
        getDuration,
        destroy,
        animationLoaded,
        animationItem: animationInstanceRef.current,
    };
};
export default useLottie;