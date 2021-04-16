{
    "targets": [
        
        #{
         #   "target_name": "native_emitter",
          #  "cflags!": [ "-fno-exceptions" ],
          #  "cflags_cc!": [ "-fno-exceptions" ],
          #  "sources": [ 
          #      "native/native_emitter/binding.cpp",
          #      "native/native_emitter/NativeEmitter.cpp" 
          #  ],
          #  "include_dirs": [
          #      "<!@(node -p \"require('node-addon-api').include\")"
          #  ],
          #  'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
        #},
        {
            "target_name": "native_game",
            "type":"loadable_module",
            "cflags!": [ "-fno-exceptions" ],
            "cflags_cc!": [ "-fno-exceptions" ],
            "sources": [ 
                "native/native_game/quadtree/Quadtree.cpp",
                "native/native_game/Game.cpp",
                "native/native_game/NapiGame.cpp",
                "native/native_game/binding.cpp",
                "native/native_game/entities/Player.cpp",
            ],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'defines': [ 'NAPI_CPP_EXCEPTIONS' ],
        },
    ]
}
