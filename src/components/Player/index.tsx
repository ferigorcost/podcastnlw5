import { useRef, useEffect, useState } from 'react';
import Imagem from 'next/image';
import { usePlayer } from '../../contexts/PlayerContexts';
import style from './styles.module.scss';
import Slider from 'rc-slider';

import'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying, 
        hasNext, 
        hasPrevious,
        isLooping,
        isShuffling,
        toggleLoop,
        togglePlay, 
        toggleShuffle,
        setPlayingState, 
        playNext, 
        playPrevious, 
        clearPlayerState } = usePlayer();

    const episode = episodeList[currentEpisodeIndex];

    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        })
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }
    
    function handleEpisodeEnded(){
        if(hasNext) {
            playNext();
        } else {
            clearPlayerState();
        }
    }

    useEffect (() => {
        if(!audioRef.current) {
            return;
        }
        if(isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }

    }, [isPlaying])

    return (
        <div className={style.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora" />
                <strong>Tocando agora</strong>
            </header>

            { episode ? (
                <div className={style.currentEpisode}>
                    <Imagem width={592} height={592} src={episode.thumbnail} objectFit="cover"/>
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>

            ) : (
                <div className={style.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}


            <footer className={!episode ? style.empty : ''}>
                <div className={style.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={style.slider}>
                        { episode ? (
                            <Slider 
                              max={episode.duration}
                              value={progress}
                              onChange={handleSeek}
                              trackStyle = {{ backgroundColor: '#04d381'}}
                              railStyle = {{ backgroundColor: '#9f75ff'}}
                              handleStyle = {{ backgroundColor: '#04d381', borderWidth: 4}}
                            />
                        ) : (
                            <div className={style.emptySlider} />
                        ) }
                        
                    </div>                    
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                
                { episode && (
                    <audio src={episode.url}
                    ref={audioRef}
                    loop={isLooping} 
                    autoPlay 
                    onEnded={handleEpisodeEnded}                                       
                    onPlay={() => setPlayingState(true)} 
                    onPause={() => setPlayingState(false)} 
                    onLoadedMetadata={setupProgressListener}/>
                )}

                </div>
                <div className={style.buttons}>
                    <button type="button" 
                      disabled={!episode || episodeList.length === 1}
                      onClick={toggleShuffle}
                      className={isShuffling ? style.isActive : ''}>
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>
                    <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar Anterior"/>
                    </button>
                    <button type="button" disabled={!episode} onClick={togglePlay}>
                        {isPlaying ? (
                            <img src="/pause.svg" alt="Pausar"/>
                        ) : (
                            <img src="/play.svg" alt="Tocar"/>
                        )}
                        
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode  || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima"/>
                    </button>
                    <button type="button" disabled={!episode} 
                         onClick={toggleLoop} 
                        className={isLooping ? style.isActive : ''}>
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>

        </div>
    );
}