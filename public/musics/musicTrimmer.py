from pydub import AudioSegment
import os

def cut_audio(input_file, output_file, start_time, end_time):
    """
    Cut parts of an audio file and save it to a new file.

    Args:
        input_file (str): Path to the input audio file.
        output_file (str): Path to save the output audio file.
        start_time (int): Start time in milliseconds.
        end_time (int): End time in milliseconds.
    """
    # Load the audio file
    audio = AudioSegment.from_file(input_file)

    # Cut the audio
    cut_audio = audio[start_time:end_time]

    # Save the cut audio to a new file
    cut_audio.export(output_file, format="ogg")


FOLDER = "sugarlessBakery"
DURATION = 208800

def folder_cut():
    for filename in os.listdir(FOLDER):
        input_file = FOLDER + "/" + filename
        output_file = FOLDER + "/" + filename
        start_time = 0  # Start at 10 seconds
        end_time = DURATION  # End at 30 seconds
        cut_audio(input_file, output_file, start_time, end_time)


# folder_cut()