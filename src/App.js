import { useState, useRef, useEffect } from "react";

import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as oflow from "oflow"

import { Social } from "./components/Social/Social";
import { findAngle, findAxis } from './utils/math'

import LinkedinIcon from './assets/linkedin.png'
import GithubIcon from './assets/github.png'
import CorrectIcon from './assets/checked.png'
import InCorrectIcon from './assets/cancel.png'
import './App.css';


const fps = 2
const PUSH_UP_ANGLE = 65
const videoSize = Object.freeze({ width: 550, height: 412 })
const pushUpPoses = Object.freeze({ NEUTRAL: 'neutral', HALF: 'half', FULL: 'full' })
const armKeyPoints = ['left_shoulder', 'right_shoulder', 'right_wrist', 'left_wrist', 'right_elbow', 'left_elbow']
const socialMedias = [
    {
        url: 'http://bit.ly/37WeU4G',
        alt: 'github',
        icon: GithubIcon
    },
    {
        url: 'https://bit.ly/2WV31Wd',
        alt: 'linkedin',
        icon: LinkedinIcon
    }
]

const App = () => {
    const [model, setModel] = useState(null)
    const [currentPushUpPose, setCurrentPushUpPose] = useState(pushUpPoses.NEUTRAL)
    const [pushUpCount, setPushUpCount] = useState(0)
    const [isUserPositioned, setIsUserPositioned] = useState(false)
    const [bodyDirection, setBodyDirection] = useState(null)
    const [isVideoReady, setVideoReady] = useState(false)
    const videoRef = useRef(null)


    useEffect(async () => {
        const poseDetectionModel = await loadPoseModel()
        poseDetectionModel && console.log('loaded model', poseDetectionModel);
        await setupCamera()
        setModel(poseDetectionModel)
    }, [])

    useEffect(() => {
        if(isVideoReady && model) {
            startDetectingPose()
        }
    }, [isVideoReady, model])

    const resetScore = () => {
        setPushUpCount(0)
    }
    const startDetectingPose = async () => {
        if (model && videoRef.current) {
            const result = await model.estimatePoses(videoRef.current)
            const [firstPerson] = result
            const armKeyPoints = getArmKeyPoints(firstPerson)

            const { leftArmAngle, rightArmAngle } = calculateArmsAngels(armKeyPoints)
            const isPushUpCompleted = calculatePushUp(leftArmAngle, rightArmAngle)
            if(isPushUpCompleted) {
                setPushUpCount(pushUpCount => pushUpCount+1)
            }

            setTimeout(() => requestAnimationFrame(startDetectingPose), 1000 / fps)
        }
    }

    const calculatePushUp = (leftArmDegrees, rightArmDegrees) => (leftArmDegrees <= PUSH_UP_ANGLE && rightArmDegrees <= PUSH_UP_ANGLE)

    const calculateArmsAngels = ({ left_shoulder, right_shoulder, right_wrist, left_wrist, right_elbow, left_elbow }) =>
        ({
            leftArmAngle: findAngle(left_shoulder, left_elbow, left_wrist) * 180 / Math.PI,
            rightArmAngle: findAngle(right_shoulder, right_elbow, right_wrist) * 180 / Math.PI
        })

    const setupCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                'Browser API navigator.mediaDevices.getUserMedia not available');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: videoSize.width,
                height: videoSize.height,
            }
        })
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }


    const loadPoseModel = async () => {
        console.log('loading model...');
        return await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        )
    }

    const getArmKeyPoints = ({ keypoints }) => {
        return keypoints.reduce((acc, keypoint) => {
            const { name } = keypoint
            if (armKeyPoints.includes(name)) acc[name] = keypoint
            return acc
        }, {})
    }

    return (
        <div className={'app'}>
            <div className={'title'}>
                <h1>Touch the Dot</h1>
                <div className={'social-media-container'}>
                    {socialMedias.map(({ alt, url, icon }) =>
                        <Social key={alt} alt={alt} icon={icon} url={url}/>)
                    }
                </div>
            </div>
            <h1>Push up count: {pushUpCount}</h1>
            <button onClick={() => resetScore}>Reset</button>
            <div>
                {/*<img src={isUserPositioned ? CorrectIcon : InCorrectIcon} alt="inCorrectIcon"/>*/}
                <video
                    ref={videoRef}
                    id={'stream-video'}
                    playsInline
                    autoPlay
                    muted
                    width={videoSize.width}
                    height={videoSize.height}
                    className={'stream-video'}
                    // onLoadedData={() => requestAnimationFrame(startDetectingPose)}
                    onLoadedData={() => setVideoReady(true)}
                />
            </div>
        </div>
    )
};

export default App;
