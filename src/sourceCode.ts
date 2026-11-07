import picklebotSource from './assets/source/picklebot.js?raw'
import musicMatrixSource from './assets/source/music-matrix/MusicMatrix.ino?raw'
import spectrumUiSource from './assets/source/music-matrix/SpectrumUi.h?raw'

export type SourceCodeId = 'picklebot' | 'music-matrix'

export const sourceProjects = {
  picklebot: {
    title: 'Picklebot',
    files: [{ name: 'picklebot.js', language: 'JavaScript', icon: 'JS', content: picklebotSource }],
  },
  'music-matrix': {
    title: 'Music Matrix',
    files: [
      { name: 'MusicMatrix.ino', language: 'Arduino / C++', icon: 'C++', content: musicMatrixSource },
      { name: 'SpectrumUi.h', language: 'C++ header', icon: 'C++', content: spectrumUiSource },
    ],
  },
} satisfies Record<SourceCodeId, { title: string; files: { name: string; language: string; icon: string; content: string }[] }>
