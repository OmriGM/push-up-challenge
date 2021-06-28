import { useState, useRef, useEffect } from "react";

import { Social } from "./components/Social/Social";

import * as poseDetection from '@tensorflow-models/pose-detection';

import LinkedinIcon from './assets/linkedin.png'
import GithubIcon from './assets/github.png'
import './App.css';


const wantedKeypoints = ['left_shoulder', 'right_shoulder', 'right_wrist', 'left_wrist', 'right_elbow', 'left_elbow']

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
    const [isVideoReady, setIsVideoReady] = useState(false)
    const [pushupCount, setPushUpCount] = useState(0)
    const [model, setModel] = useState({})
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        loadPoseModel()
    }, [])

    const loadPoseModel = async () => {
        const poseDetectionModel = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet)
        setModel(poseDetectionModel)
    }

    const getWantedKeypoints = keypoints => {
        return keypoints.reduce((acc, keypoint) => {
            const { name } = keypoint
            if (name in wantedKeypoints) return acc[name] = keypoint
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
            <video
                ref={videoRef}
                id={'stream-video'}
                playsinline
                autoPlay
                muted
                // width={videoSize.width}
                // height={videoSize.height}
                className={'stream-video'}
                onLoadedData={() => setIsVideoReady(true)}
            />
            {/*<canvas*/}
                {/*ref={canvasRef}*/}
                {/*style={{ left: left, top: top }}*/}
                {/*height={videoSize.height}*/}
                {/*width={videoSize.width}*/}
            {/*/>*/}
        </div>
    )
};

export default App;
