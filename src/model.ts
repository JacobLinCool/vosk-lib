import path from "node:path";
import ffi from "ffi-napi";
import ref from "ref-napi";

const vosk_model = ref.types.void;
const vosk_model_ptr = ref.refType(vosk_model);
const vosk_spk_model = ref.types.void;
const vosk_spk_model_ptr = ref.refType(vosk_spk_model);
const vosk_recognizer = ref.types.void;
const vosk_recognizer_ptr = ref.refType(vosk_recognizer);

function get_lib(): string {
    const dir = path.resolve(__dirname, "..", `bin-${process.platform}-${process.arch}`);
    if (process.platform == "win32") {
        // Update path to load dependent dlls
        process.env.Path = dir + path.delimiter + process.env.Path;

        return path.join(dir, "libvosk.dll");
    } else if (process.platform == "darwin") {
        return path.join(dir, "libvosk.dylib");
    } else {
        return path.join(dir, "libvosk.so");
    }
}

export const libvosk = ffi.Library(get_lib(), {
    vosk_set_log_level: ["void", ["int"]],
    vosk_model_new: [vosk_model_ptr, ["string"]],
    vosk_model_free: ["void", [vosk_model_ptr]],
    vosk_spk_model_new: [vosk_spk_model_ptr, ["string"]],
    vosk_spk_model_free: ["void", [vosk_spk_model_ptr]],
    vosk_recognizer_new: [vosk_recognizer_ptr, [vosk_model_ptr, "float"]],
    vosk_recognizer_new_spk: [vosk_recognizer_ptr, [vosk_model_ptr, "float", vosk_spk_model_ptr]],
    vosk_recognizer_new_grm: [vosk_recognizer_ptr, [vosk_model_ptr, "float", "string"]],
    vosk_recognizer_free: ["void", [vosk_recognizer_ptr]],
    vosk_recognizer_set_max_alternatives: ["void", [vosk_recognizer_ptr, "int"]],
    vosk_recognizer_set_words: ["void", [vosk_recognizer_ptr, "bool"]],
    vosk_recognizer_set_partial_words: ["void", [vosk_recognizer_ptr, "bool"]],
    vosk_recognizer_set_spk_model: ["void", [vosk_recognizer_ptr, vosk_spk_model_ptr]],
    vosk_recognizer_accept_waveform: ["bool", [vosk_recognizer_ptr, "pointer", "int"]],
    vosk_recognizer_result: ["string", [vosk_recognizer_ptr]],
    vosk_recognizer_final_result: ["string", [vosk_recognizer_ptr]],
    vosk_recognizer_partial_result: ["string", [vosk_recognizer_ptr]],
    vosk_recognizer_reset: ["void", [vosk_recognizer_ptr]],
});

/**
 * Build a Model from a model directory.
 * @see [available models](https://alphacephei.com/vosk/models)
 */
export class Model {
    /** Store the handle. For internal use only */
    public handle: ref.Pointer<void>;

    /**
     * Build a Model to be used with the voice recognition. Each language should have it's own Model
     * for the speech recognition to work.
     * @param modelPath The abstract pathname to the model
     * @see [available models](https://alphacephei.com/vosk/models)
     */
    constructor(modelPath: string) {
        this.handle = libvosk.vosk_model_new(modelPath);
    }

    /**
     * Releases the model memory
     *
     * The model object is reference-counted so if some recognizer
     * depends on this model, model might still stay alive. When
     * last recognizer is released, model will be released too.
     */
    public free(): void {
        libvosk.vosk_model_free(this.handle);
    }
}

/**
 * Build a Speaker Model from a speaker model file.
 * The Speaker Model enables speaker identification.
 * @see [available models](https://alphacephei.com/vosk/models)
 */
export class SpeakerModel {
    /** Store the handle. For internal use only */
    public handle: ref.Pointer<void>;
    /**
     * Loads speaker model data from the file and returns the model object
     *
     * @param modelPath the path of the model on the filesystem
     * @see [available models](https://alphacephei.com/vosk/models)
     */
    constructor(modelPath: string) {
        this.handle = libvosk.vosk_spk_model_new(modelPath);
    }

    /**
     * Releases the model memory
     *
     * The model object is reference-counted so if some recognizer
     * depends on this model, model might still stay alive. When
     * last recognizer is released, model will be released too.
     */
    public free(): void {
        libvosk.vosk_spk_model_free(this.handle);
    }
}
